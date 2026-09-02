/**
 * 替换工作室 v2 — 工作区外壳:首页项目库 + 顶部 5 步导航 + 页脚引导。
 * 步骤:素材设定 → 图像替换 → 视频替换 → 声音克隆 → 合成视频(对齐 ShuoCanvas)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createRsProject,
  normalizeRsProject,
  projectProgress,
  projectStepGate,
  rsId,
  type RsProject,
  type RsScene,
  type RsStepKey,
} from "../../shared/replacement-studio";
import { ensureHostApi, errorText, type RsHostApi } from "./host";
import { StudioMaterialStep } from "./StudioMaterialStep";
import { StudioImageStep, StudioVideoStep } from "./StudioProductionStep";
import { StudioVoiceStep, StudioComposeStep } from "./StudioVoiceCompose";
import "./replacement-studio.css";

export const RS_STEPS: { key: RsStepKey; label: string }[] = [
  { key: "material", label: "素材设定" },
  { key: "image", label: "图像替换" },
  { key: "video", label: "视频替换" },
  { key: "voice", label: "声音克隆" },
  { key: "compose", label: "合成视频" },
];

const STEP_NEXT_LABELS: Record<RsStepKey, string> = {
  material: "进入图像替换",
  image: "进入视频替换",
  video: "进入声音克隆",
  voice: "进入合成视频",
  compose: "完成",
};

const STEP_GUIDANCE: Record<RsStepKey, { title: string; detail: string }> = {
  material: {
    title: "请先导入素材并完成镜头分析",
    detail: "选择一条视频(或图片):智能裁剪自动切分镜头 → 逐镜头检测人物 → 跨镜头聚类身份,然后绑定目标角色。",
  },
  image: {
    title: "请绑定替换人物/场景",
    detail: "在右侧为每个身份选择目标角色与形象,确认替换范围后逐镜头(或批量)生成替换图。",
  },
  video: {
    title: "逐镜头生成替换视频",
    detail: "选择视频输入模式(替换首帧/人物参考图),提示词与模型确认后生成;镜头可批量生成。",
  },
  voice: {
    title: "声音克隆(可选)",
    detail: "为每个镜头填写台词(可自动转写),选择目标音色参考,生成克隆配音;不生成则合成时保留原声。",
  },
  compose: {
    title: "合成视频",
    detail: "把所有镜头片段按顺序拼接,并混合克隆音轨,导出最终替换视频。",
  },
};

export function ReplacementStudioWorkspace({ onExit }: { onExit: () => void }) {
  const [projects, setProjects] = useState<RsProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<RsProject | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const hostRef = useRef<RsHostApi | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ensureHostApi()
      .then((host) => {
        hostRef.current = host;
        return host.projectsLoad();
      })
      .then((result) => {
        if (cancelled) return;
        const list = (Array.isArray(result?.projects) ? result.projects : [])
          .map(normalizeRsProject)
          .filter((p): p is RsProject => p !== null);
        setProjects([...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      })
      .catch((reason) => {
        if (!cancelled) setError(errorText(reason));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const current = useMemo(
    () => projects.find((p) => p.id === currentId) ?? null,
    [projects, currentId],
  );

  // 经过 onchange 顺序更新时,必须基于“最新”项目快照,而不是渲染闭包快照
  // (否则循环里连续两次 onChange 会互相覆盖)。
  const projectsRef = useRef<RsProject[]>([]);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  const persist = useCallback(async (next: RsProject) => {
    setProjects((list) => {
      const exists = list.some((p) => p.id === next.id);
      return exists ? list.map((p) => (p.id === next.id ? next : p)) : [next, ...list];
    });
    const host = hostRef.current;
    if (!host) return;
    setSaveState("saving");
    try {
      const result = await host.projectSave(next);
      if (result && result.ok === false) {
        setSaveState("idle");
        setError(result.error || "项目保存失败");
      } else {
        setSaveState("saved");
      }
    } catch (reason) {
      setSaveState("idle");
      setError(`项目保存失败: ${errorText(reason)}`);
    }
  }, []);

  const updateProject = useCallback(
    async (mutator: (project: RsProject) => RsProject) => {
      const base = projectsRef.current.find((p) => p.id === currentId);
      if (!base) return;
      await persist({ ...mutator(base), updatedAt: new Date().toISOString() });
    },
    [currentId, persist],
  );

  const createProject = useCallback(
    async (title: string) => {
      const project = createRsProject(title);
      await persist(project);
      setCurrentId(project.id);
    },
    [persist],
  );

  const removeProject = useCallback(
    async (project: RsProject) => {
      const host = hostRef.current;
      if (host) {
        try {
          await host.projectDelete(project.id);
        } catch (reason) {
          setError(`删除失败: ${errorText(reason)}`);
          return;
        }
      }
      setProjects((list) => list.filter((p) => p.id !== project.id));
      if (currentId === project.id) setCurrentId(null);
      setConfirmDelete(null);
    },
    [currentId],
  );

  const exitStudio = useCallback(() => {
    void hostRef.current?.hide().catch(() => void 0);
    onExit();
  }, [onExit]);

  const goStep = useCallback(
    async (step: RsStepKey) => {
      if (!current) return;
      const gate = projectStepGate(current, step);
      if (!gate.ok) {
        setError(gate.reason);
        return;
      }
      await updateProject((project) => ({ ...project, step }));
    },
    [current, updateProject],
  );

  const selectShot = useCallback(
    (shotId: string) => {
      setSelectedShotId(shotId);
      void updateProject((project) => ({
        ...project,
        workspace: { selectedShotId: shotId },
      }));
    },
    [updateProject],
  );

  const selectedShot = useMemo(() => {
    if (!current) return null;
    return current.shots.find((s) => s.id === selectedShotId) ?? current.shots[0] ?? null;
  }, [current, selectedShotId]);

  // ------------------------------------------------------------------ 渲染
  return (
    <div className="rs-root v2" data-replacement-studio="1">
      <header className="rs-topbar">
        <button className="rs-btn ghost" onClick={() => setCurrentId(null)} title="返回项目列表">
          ← 替换项目
        </button>
        <span className="rs-title">替换工作室</span>
        {current && (
          <span className="rs-subtitle" title={current.title}>
            {current.title}
          </span>
        )}
        <span className="rs-spacer" />
        {current && <span className="rs-tag">已完成 {projectProgress(current)}%</span>}
        {current && (
          <span className="rs-save-state">
            {saveState === "saving" ? "保存中…" : saveState === "saved" ? "已保存" : ""}
          </span>
        )}
        {current && (
          <button className="rs-btn danger" onClick={() => setConfirmDelete(current)}>
            删除项目
          </button>
        )}
        <button className="rs-btn primary" onClick={exitStudio}>
          回到工作台
        </button>
      </header>

      {current && (
        <nav className="rs-steps v2" aria-label="步骤导航" data-active-step={current.step}>
          {RS_STEPS.map((item, index) => {
            const gate = projectStepGate(current, item.key);
            const active = current.step === item.key;
            const locked = !gate.ok && !active;
            return (
              <button
                key={item.key}
                className={`rs-step${active ? " active" : ""}${locked ? " locked" : ""}`}
                aria-disabled={locked}
                title={locked ? gate.reason : item.label}
                onClick={() => void goStep(item.key)}
              >
                <span className="rs-step-num">{index + 1}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {error && (
        <div className="rs-banner error" style={{ margin: "0 16px" }}>
          {error}
          <button className="rs-btn ghost" onClick={() => setError("")}>
            关闭
          </button>
        </div>
      )}

      <div className="rs-body">
        {loading ? (
          <div className="rs-scroll center">
            <p className="rs-muted">
              <span className="rs-spinner" /> 正在加载替换工作室…
            </p>
          </div>
        ) : current ? (
          <div className="rs-project-stage">
            {current.step === "material" && (
              <StudioMaterialStep project={current} onChange={updateProject} />
            )}
            {current.step === "image" && (
              <StudioImageStep
                project={current}
                onChange={updateProject}
                selectedShot={selectedShot}
                onSelectShot={selectShot}
              />
            )}
            {current.step === "video" && (
              <StudioVideoStep
                project={current}
                onChange={updateProject}
                selectedShot={selectedShot}
                onSelectShot={selectShot}
              />
            )}
            {current.step === "voice" && (
              <StudioVoiceStep
                project={current}
                onChange={updateProject}
                selectedShot={selectedShot}
                onSelectShot={selectShot}
              />
            )}
            {current.step === "compose" && (
              <StudioComposeStep project={current} onChange={updateProject} />
            )}
          </div>
        ) : (
          <HomeView
            projects={projects}
            onCreateClick={() => {
              setCreateTitle("未命名替换项目");
              setCreateOpen(true);
            }}
            onOpen={(project) => {
              void persist(project).then(() => {
                setCurrentId(project.id);
                setSelectedShotId(project.workspace?.selectedShotId ?? project.shots[0]?.id ?? null);
              });
            }}
            onDelete={(project) => setConfirmDelete(project)}
          />
        )}
      </div>

      {current && (
        <footer className="rs-step-footer">
          <div className="rs-guidance">
            <strong>{STEP_GUIDANCE[current.step].title}</strong>
            <small>{STEP_GUIDANCE[current.step].detail}</small>
          </div>
          <div className="rs-footer-actions">
            {RS_STEPS.findIndex((s) => s.key === current.step) > 0 && (
              <button
                className="rs-btn"
                onClick={() =>
                  void goStep(RS_STEPS[RS_STEPS.findIndex((s) => s.key === current.step) - 1]!.key)
                }
              >
                ← 上一步
              </button>
            )}
            <button
              className="rs-btn primary"
              onClick={() => {
                const index = RS_STEPS.findIndex((s) => s.key === current.step);
                if (index < RS_STEPS.length - 1) void goStep(RS_STEPS[index + 1]!.key);
              }}
            >
              {STEP_NEXT_LABELS[current.step]}
              {current.step !== "compose" ? " →" : ""}
            </button>
          </div>
        </footer>
      )}

      {confirmDelete && (
        <div className="rs-modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="rs-modal" onClick={(event) => event.stopPropagation()}>
            <h2>删除项目「{confirmDelete.title}」？</h2>
            <p className="rs-muted">仅删除替换工作室的记录，不会删除磁盘上的素材与生成结果文件。</p>
            <div className="actions">
              <button className="rs-btn" onClick={() => setConfirmDelete(null)}>
                取消
              </button>
              <button className="rs-btn danger" onClick={() => void removeProject(confirmDelete)}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="rs-modal-backdrop" onClick={() => setCreateOpen(false)}>
          <div className="rs-modal" onClick={(event) => event.stopPropagation()}>
            <h2>新建替换项目</h2>
            <div className="rs-field">
              <span>项目名称</span>
              <input
                autoFocus
                value={createTitle}
                onChange={(event) => setCreateTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setCreateOpen(false);
                    void createProject(createTitle);
                  }
                }}
                placeholder="例如：广告替换 001"
              />
            </div>
            <div className="actions">
              <button className="rs-btn" onClick={() => setCreateOpen(false)}>
                取消
              </button>
              <button
                className="rs-btn primary"
                onClick={() => {
                  setCreateOpen(false);
                  void createProject(createTitle);
                }}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeView({
  projects,
  onCreateClick,
  onOpen,
  onDelete,
}: {
  projects: RsProject[];
  onCreateClick: () => void;
  onOpen: (project: RsProject) => void;
  onDelete: (project: RsProject) => void;
}) {
  const [filter, setFilter] = useState("");
  const filtered = filter.trim()
    ? projects.filter((p) => p.title.toLowerCase().includes(filter.trim().toLowerCase()))
    : projects;
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  useEffect(() => {
    const need = projects.filter((p) => p.shots[0]?.keyframePath && !(p.id in previews));
    if (need.length === 0) return;
    let cancelled = false;
    void ensureHostApi()
      .then((host) =>
        Promise.all(
          need.map(async (p) => {
            const url = await host.readImage(p.shots[0]!.keyframePath!).catch(() => null);
            return [p.id, url] as const;
          }),
        ),
      )
      .then((entries) => {
        if (cancelled) return;
        setPreviews((cur) => {
          const next = { ...cur };
          for (const [id, url] of entries) next[id] = url ?? null;
          return next;
        });
      })
      .catch(() => void 0);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);
  return (
    <div className="rs-scroll center">
      <div style={{ width: "100%", maxWidth: 1100 }}>
        <div className="rs-hero">
          <div style={{ flex: "1 1 320px" }}>
            <div className="title">替换工作室</div>
            <div className="sub">
              导入视频 → 智能裁剪（FFmpeg 场景检测，平衡/稳定/敏感）→ 检测人物 →
              绑定目标形象 → 逐镜头替换 → 声音克隆 → 合成导出
            </div>
            <div className="sub">
              生成与检测使用 YUH 中转站配置（AI 对话设置）；智能裁剪需本机 ffmpeg（可用 FFMPEG_PATH 指定）。
            </div>
          </div>
          <button className="rs-btn primary" style={{ padding: "9px 18px", fontSize: 13 }} onClick={onCreateClick}>
            ＋ 新建项目
          </button>
        </div>
        <div className="rs-home-head">
          <h1>项目库</h1>
          <p>最近更新优先显示</p>
          <span style={{ flex: 1 }} />
          <input
            className="rs-filter"
            value={filter}
            placeholder="按项目名称筛选…"
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>
        <div className="rs-project-grid">
          <button className="rs-new-card" onClick={onCreateClick}>
            <span className="plus">＋</span>
            新建项目
          </button>
          {filtered.map((project) => {
            const progress = projectProgress(project);
            const imageCount = project.shots.reduce((n, s) => n + s.imageResults.length, 0);
            return (
              <div className="rs-project-card" key={project.id} onClick={() => onOpen(project)}>
                <div className="thumb">
                  {previews[project.id] ? (
                    <img src={previews[project.id]!} alt={project.title} />
                  ) : (
                    <span className="empty">{project.sources.length > 0 ? "素材加载中…" : "未设置素材"}</span>
                  )}
                </div>
                <div className="meta">
                  <div className="name">{project.title}</div>
                  <div className="info">
                    <span>
                      {new Date(project.updatedAt).toLocaleString("zh-CN", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="entry-badge">{progress}% · 图 {imageCount}</span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <div className="rs-progress">
                      <div className="fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="info" style={{ marginTop: 6 }}>
                    <span className="rs-tag">
                      {project.shots.length > 0 ? `${project.shots.length} 镜头` : "未分析"}
                    </span>
                    <span>
                      {project.sourceCharacters.length} 身份 · {project.characters.length} 角色
                    </span>
                  </div>
                </div>
                <div style={{ padding: "0 12px 10px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="rs-btn ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(project);
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="rs-muted" style={{ marginTop: 12 }}>
            {projects.length === 0
              ? "还没有项目。点击「新建项目」开始：导入视频 → 智能裁剪 → 检测人物 → 绑定目标形象 → 逐镜头替换。"
              : `没有匹配「${filter}」的项目。`}
          </p>
        )}
      </div>
    </div>
  );
}

export { rsId };
