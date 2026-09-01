/**
 * 替换工作室 — 主工作区(项目库首页 + 项目编辑器框架)。
 * 由 YUH 侧边栏「替换工作室」入口打开(Serpent hosted 视图内全屏渲染)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createRsProject,
  type RsProject,
  RS_LETTERS,
} from "../../shared/replacement-studio";
import { ensureHostApi, errorText, type RsHostApi } from "./host";
import { StudioMaterialStep } from "./StudioMaterialStep";
import { StudioBindingStep } from "./StudioBindingStep";
import { StudioImageStep } from "./StudioImageStep";
import { StudioVideoStep } from "./StudioVideoStep";
import { StudioExportStep } from "./StudioExportStep";
import "./replacement-studio.css";

export const RS_STEPS = [
  { key: "material", title: "素材设定" },
  { key: "binding", title: "人物绑定" },
  { key: "image", title: "图像替换" },
  { key: "video", title: "视频替换" },
  { key: "export", title: "导出" },
] as const;

export type RsStepKey = (typeof RS_STEPS)[number]["key"];

export function ReplacementStudioWorkspace({ onExit }: { onExit: () => void }) {
  const [projects, setProjects] = useState<RsProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [step, setStep] = useState<RsStepKey>("material");
  const [confirmDelete, setConfirmDelete] = useState<RsProject | null>(null);
  const [createTitle, setCreateTitle] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
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
        const list = Array.isArray(result?.projects) ? result.projects : [];
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

  const persist = useCallback(async (next: RsProject) => {
    setProjects((list) => {
      const exists = list.some((p) => p.id === next.id);
      return exists
        ? list.map((p) => (p.id === next.id ? next : p))
        : [next, ...list];
    });
    const host = hostRef.current;
    if (!host) return;
    try {
      const result = await host.projectSave(next);
      if (result && result.ok === false) {
        setError(result.error || "项目保存失败");
      }
    } catch (reason) {
      setError(`项目保存失败: ${errorText(reason)}`);
    }
  }, []);

  const updateProject = useCallback(
    async (mutator: (project: RsProject) => RsProject) => {
      const base = projects.find((p) => p.id === currentId);
      if (!base) return;
      const next = {
        ...mutator(base),
        updatedAt: new Date().toISOString(),
      };
      await persist(next);
    },
    [projects, currentId, persist],
  );

  const createProject = useCallback(
    async (title: string) => {
      const project = createRsProject(title);
      await persist(project);
      setCurrentId(project.id);
      setStep("material");
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
      if (currentId === project.id) {
        setCurrentId(null);
        setStep("material");
      }
      setConfirmDelete(null);
    },
    [currentId],
  );

  const exitStudio = useCallback(() => {
    void hostRef.current?.hide().catch(() => void 0);
    onExit();
  }, [onExit]);

  const canEnter = useCallback(
    (key: RsStepKey): boolean => {
      if (!current) return false;
      const base = current.base;
      const hasBound = current.sourceCharacters.some(
        (c) => c.targetCharacterId && c.targetAppearanceId,
      );
      const hasImage = current.shots.some((s) => s.imageResults.length > 0);
      switch (key) {
        case "material":
          return true;
        case "binding":
          return Boolean(base?.keyframePath);
        case "image":
          return Boolean(base?.keyframePath) && hasBound;
        case "video":
          return hasImage;
        case "export":
          return true;
      }
    },
    [current],
  );

  return (
    <div className="rs-root" data-replacement-studio="1">
      <header className="rs-topbar">
        <span className="rs-title">替换工作室</span>
        {current && (
          <span className="rs-subtitle" title={current.title}>
            {current.title}
          </span>
        )}
        <span className="rs-spacer" />
        {current && (
          <button className="rs-btn danger" onClick={() => setConfirmDelete(current)}>
            删除项目
          </button>
        )}
        <button className="rs-btn primary" onClick={exitStudio}>
          返回资源管理
        </button>
      </header>

      {current && (
        <nav className="rs-steps">
          {RS_STEPS.map((item, index) => {
            const allowed = canEnter(item.key);
            return (
              <button
                key={item.key}
                className={`rs-step${step === item.key ? " active" : ""}`}
                disabled={!allowed && step !== item.key}
                onClick={() => setStep(item.key)}
                title={!allowed ? "请先完成前序步骤" : item.title}
              >
                <span className="rs-step-num">{index + 1}</span>
                {item.title}
              </button>
            );
          })}
        </nav>
      )}

      {error && (
        <div className="rs-scroll" style={{ paddingBottom: 0 }}>
          <div className="rs-banner error">
            {error}
            <button className="rs-btn ghost" onClick={() => setError("")}>
              关闭
            </button>
          </div>
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
          <div className="rs-scroll">
            {step === "material" && (
              <StudioMaterialStep project={current} onChange={updateProject} />
            )}
            {step === "binding" && (
              <StudioBindingStep project={current} onChange={updateProject} />
            )}
            {step === "image" && (
              <StudioImageStep project={current} onChange={updateProject} />
            )}
            {step === "video" && (
              <StudioVideoStep project={current} onChange={updateProject} />
            )}
            {step === "export" && (
              <StudioExportStep project={current} onChange={updateProject} onExit={exitStudio} />
            )}
          </div>
        ) : (
          <div className="rs-scroll center">
            <div style={{ width: "100%", maxWidth: 1100 }}>
              <div className="rs-home-head">
                <h1>替换工作室 · 项目库</h1>
                <p>把图片/视频中的人物替换成你的参考形象</p>
                <span className="rs-spacer" />
              </div>
              <div className="rs-project-grid">
                <button
                  className="rs-new-card"
                  onClick={() => {
                    setCreateTitle("未命名替换项目");
                    setCreateOpen(true);
                  }}
                >
                  <span className="plus">＋</span>
                  新建项目
                </button>
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={() => {
                      void persist(project).then(() => {
                        setCurrentId(project.id);
                        setStep("material");
                      });
                    }}
                    onDelete={() => setConfirmDelete(project)}
                  />
                ))}
              </div>
              {projects.length === 0 && (
                <p className="rs-muted" style={{ marginTop: 12 }}>
                  还没有项目。点击「新建项目」开始：选择基础图片/视频 → 框选人物 →
                  绑定目标形象 → 生成替换结果。
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="rs-modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="rs-modal" onClick={(event) => event.stopPropagation()}>
            <h2>删除项目「{confirmDelete.title}」？</h2>
            <p className="rs-muted">
              仅删除替换工作室的记录，不会删除磁盘上的素材与生成结果文件。
            </p>
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

function ProjectCard({
  project,
  onOpen,
  onDelete,
}: {
  project: RsProject;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [thumb, setThumb] = useState<string | null>(null);
  const imageCount = project.shots.reduce((sum, s) => sum + s.imageResults.length, 0);
  const videoCount = project.shots.reduce((sum, s) => sum + s.videoResults.length, 0);

  useEffect(() => {
    let cancelled = false;
    const path = project.base?.keyframePath;
    if (!path) return;
    void ensureHostApi()
      .then((host) => host.readImage(path))
      .then((dataUrl) => {
        if (!cancelled) setThumb(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setThumb(null);
      });
    return () => {
      cancelled = true;
    };
  }, [project.base?.keyframePath]);

  return (
    <div className="rs-project-card" onClick={onOpen}>
      <div className="thumb">
        {thumb ? (
          <img src={thumb} alt={project.title} />
        ) : (
          <span className="empty">{project.base ? "素材加载中…" : "未设置素材"}</span>
        )}
      </div>
      <div className="meta">
        <div className="name" title={project.title}>
          {project.title}
        </div>
        <div className="info">
          <span>
            {new Date(project.updatedAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="entry-badge">
            {imageCount > 0 || videoCount > 0 ? `图 ${imageCount} · 视频 ${videoCount}` : "未生成"}
          </span>
        </div>
        <div className="info" style={{ marginTop: 6 }}>
          <span className="rs-tag">
            {project.base?.kind === "video" ? "视频" : "图片"}
          </span>
          <span>
            {project.sourceCharacters.length} 人 · {project.targetCharacters.length} 角色
          </span>
        </div>
      </div>
      <div style={{ padding: "0 12px 10px", display: "flex", justifyContent: "flex-end" }}>
        <button
          className="rs-btn ghost"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          删除
        </button>
      </div>
    </div>
  );
}

export { RS_LETTERS };
