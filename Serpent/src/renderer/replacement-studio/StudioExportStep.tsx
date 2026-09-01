/**
 * 步骤 5 · 导出:输出目录/结果汇总/历史记录。
 */
import { useEffect, useState } from "react";
import type { RsProject } from "../../shared/replacement-studio";
import { ensureHostApi, errorText } from "./host";

export function StudioExportStep({
  project,
  onChange,
  onExit,
}: {
  project: RsProject;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
  onExit: () => void;
}) {
  const [outputDir, setOutputDir] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void ensureHostApi()
      .then((host) => host.workspace())
      .then((info) => setOutputDir(info.outputDir || ""))
      .catch((reason) => setMessage(errorText(reason)));
  }, []);

  const showInFolder = async (path: string) => {
    const host = await ensureHostApi();
    setMessage("");
    try {
      await host.showItem(path);
    } catch (reason) {
      setMessage(errorText(reason));
    }
  };

  const images = project.shots.flatMap((shot) => shot.imageResults);
  const videos = project.shots.flatMap((shot) => shot.videoResults);
  const activeImage = project.shots[0]?.imageResults[project.shots[0]?.imageActiveIndex ?? 0] ?? null;
  const activeVideo = project.shots[0]?.videoResults[project.shots[0]?.videoActiveIndex ?? 0] ?? null;
  const bound = project.sourceCharacters.filter((c) => c.targetCharacterId && c.targetAppearanceId);
  const completing = bound.length > 0 && images.length > 0;

  return (
    <div className="rs-editor">
      {message && (
        <div className="rs-banner error">
          {message}
          <button className="rs-btn ghost" onClick={() => setMessage("")}>
            关闭
          </button>
        </div>
      )}

      <div className="rs-banner info">
        生成结果已自动保存到 YUH Studio 的输出文件夹；该文件夹已作为「ComfyUI 输出」链接到资源管理，
        打开「资源管理 → 生成资产」即可浏览/收藏所有替换结果。
      </div>

      <div className="rs-grid">
        <section className="rs-panel">
          <h3>输出目录</h3>
          <p className="rs-muted" style={{ wordBreak: "break-all" }}>
            {outputDir || "未配置输出文件夹（请在 YUH Studio 的「存储设置」中选择输出文件夹）"}
          </p>
          <div className="rs-row">
            <button
              className="rs-btn"
              disabled={!outputDir}
              onClick={() =>
                void ensureHostApi().then((host) => host.openPath(outputDir).catch((e) => setMessage(errorText(e))))
              }
            >
              打开输出文件夹
            </button>
            {activeImage && (
              <button className="rs-btn" onClick={() => void showInFolder(activeImage.outputPath)}>
                定位当前替换图
              </button>
            )}
            {activeVideo && (
              <button className="rs-btn" onClick={() => void showInFolder(activeVideo.outputPath)}>
                定位当前视频
              </button>
            )}
          </div>
        </section>

        <section className="rs-panel">
          <h3>完成度</h3>
          <div className="rs-row">
            <span className="rs-tag">{project.sourceCharacters.length} 人物框</span>
            <span className="rs-tag">{bound.length} 已绑定</span>
            <span className="rs-tag">{project.targetCharacters.length} 目标角色</span>
            <span className="rs-tag">{images.length} 替换图</span>
            <span className="rs-tag">{videos.length} 替换视频</span>
          </div>
          <div
            className="rs-progress"
            style={{ marginTop: 10 }}
            title={completing ? "所有已绑定人物均已生成替换图" : "仍需完成人物绑定/图像替换"}
          >
            <div className="fill" style={{ width: `${Math.min(100, Math.round((completing ? 100 : 0) + (videos.length > 0 ? 0 : 0)))}%` }} />
          </div>
          <p className="rs-muted" style={{ marginTop: 6 }}>
            {completing
              ? "所有人物已绑定并生成替换图，可继续生成视频或导出。"
              : "请先完成「人物绑定」与「图像替换」。"}
          </p>
          <button className="rs-btn primary" onClick={onExit} style={{ marginTop: 4 }}>
            完成 · 返回资源管理
          </button>
        </section>
      </div>

      <section className="rs-panel">
        <h3>
          生成历史
          <span className="hint">最近 200 条</span>
        </h3>
        <div className="rs-history">
          {project.history.map((entry) => (
            <div className="rs-history-item" key={entry.id}>
              <span className={`kind ${entry.kind}`}>{entry.kind === "image" ? "图" : "视频"}</span>
              <span className="prompt" title={entry.prompt}>
                {entry.prompt}
              </span>
              <span className="time">{entry.model}</span>
              <span className="time">
                {new Date(entry.at).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
              <button
                className="rs-btn ghost"
                onClick={() => void showInFolder(entry.outputPath)}
                title="在文件夹中显示"
              >
                定位
              </button>
            </div>
          ))}
          {project.history.length === 0 && <p className="rs-muted">还没有生成记录。</p>}
        </div>
        {project.history.length > 0 && (
          <button
            className="rs-btn ghost"
            style={{ marginTop: 8 }}
            onClick={() =>
              void onChange((project) => ({ ...project, history: [] }))
            }
          >
            清空历史
          </button>
        )}
      </section>
    </div>
  );
}
