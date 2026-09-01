/**
 * 步骤 4 · 视频替换:以激活的替换图为起始帧,参考原视频(若有)生成替换视频。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildRsVideoPrompt,
  rsId,
  type RsGeneratedItem,
  type RsProject,
} from "../../shared/replacement-studio";
import { ensureHostApi, errorText, type RsProviderInfo } from "./host";
import { ResultsRow } from "./StudioImageStep";

const VIDEO_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4"];

export function StudioVideoStep({
  project,
  onChange,
}: {
  project: RsProject;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [providers, setProviders] = useState<RsProviderInfo[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [modelsError, setModelsError] = useState("");

  const shot = project.shots[0] ?? null;
  const activeImage = shot?.imageResults[shot?.imageActiveIndex ?? 0] ?? null;

  useEffect(() => {
    void ensureHostApi()
      .then((host) => host.listProviders())
      .then((list) => setProviders((list || []).filter((p) => p.enabled && p.hasApiKey)))
      .catch(() => void 0);
  }, []);

  useEffect(() => {
    const providerId = project.settings.providerId;
    if (!providerId) {
      setModels([]);
      return;
    }
    let cancelled = false;
    void ensureHostApi()
      .then((host) => host.listModels(providerId))
      .then((result) => {
        if (cancelled) return;
        const list = Array.isArray(result.models) ? result.models : [];
        setModels(list);
        if (list.length === 0 && result.error) setModelsError(result.error);
      })
      .catch((reason) => {
        if (!cancelled) setModelsError(errorText(reason));
      });
    return () => {
      cancelled = true;
    };
  }, [project.settings.providerId]);

  const bound = useMemo(
    () =>
      project.sourceCharacters
        .map((character) => {
          const target =
            character.targetCharacterId
              ? project.targetCharacters.find((c) => c.id === character.targetCharacterId) ?? null
              : null;
          const appearance = target?.appearances.find((a) => a.id === character.targetAppearanceId) ?? null;
          return { character, target: target!, appearance: appearance! };
        })
        .filter((item) => item.target && item.appearance),
    [project.sourceCharacters, project.targetCharacters],
  );

  const run = useCallback(
    async (label: string, fn: () => Promise<void>) => {
      setBusy(true);
      setMessage("");
      try {
        await fn();
      } catch (reason) {
        setMessage(`${label}失败: ${errorText(reason)}`);
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const generate = () =>
    run("生成替换视频", async () => {
      if (!shot) return;
      if (!activeImage) throw new Error("请先在「图像替换」中生成并选中一张替换图");
      if (!project.settings.videoModel.trim()) throw new Error("请选择/填写视频生成模型");
      const host = await ensureHostApi();
      const bindings = bound.map((item, index) => ({
        letter: item.character.label.replace(/^人物/, "") || String.fromCharCode(65 + index),
        label: item.character.label,
        imageIndex: null,
        scope: item.character.scope,
        characterName: item.target.name,
        appearanceName: item.appearance.name || null,
        appearancePrompt: item.appearance.prompt,
      }));
      const prompt = buildRsVideoPrompt({
        template: project.settings.videoPromptTemplate,
        shotLabel: shot.label,
        bindings,
      });
      const references: { kind: "image" | "video"; path: string }[] = [
        { kind: "image", path: activeImage.outputPath },
      ];
      if (project.base?.kind === "video" && project.base.path) {
        references.push({ kind: "video", path: project.base.path });
      }
      await onChange((project) => ({
        ...project,
        shots: project.shots.map((s) =>
          s.id === shot.id
            ? { ...s, videoPrompt: prompt, videoStatus: "generating" as const, videoError: null }
            : s,
        ),
      }));
      const result = await host.generateVideo({
        providerId: project.settings.providerId,
        model: project.settings.videoModel.trim(),
        prompt,
        duration: Math.max(1, Math.min(30, project.settings.videoDuration || 5)),
        ratio: project.settings.videoRatio,
        references,
      });
      const item: RsGeneratedItem = {
        id: rsId("vid"),
        outputPath: result.outputPath,
        outputUrl: result.outputUrl,
        createdAt: result.createdAt,
        prompt,
        model: result.model || project.settings.videoModel,
        kind: "video",
      };
      await onChange((project) => ({
        ...project,
        shots: project.shots.map((s) =>
          s.id === shot.id
            ? {
                ...s,
                videoResults: [...s.videoResults, item],
                videoActiveIndex: s.videoResults.length,
                videoStatus: "done" as const,
                videoError: null,
              }
            : s,
        ),
        history: [
          {
            id: item.id,
            kind: "video" as const,
            at: item.createdAt,
            prompt,
            model: item.model,
            outputPath: item.outputPath,
            shotId: shot.id,
          },
          ...project.history,
        ].slice(0, 200),
      }));
    });

  if (!shot) {
    return (
      <div className="rs-editor">
        <div className="rs-banner warn">请先在「素材设定」中选择基础素材。</div>
      </div>
    );
  }

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

      <div className="rs-grid">
        <section className="rs-panel">
          <h3>
            视频源
            <span className="hint">以激活替换图为起始帧{project.base?.kind === "video" ? "+ 原视频作为动作参考" : ""}</span>
          </h3>
          {activeImage ? (
            <div className="rs-media-card">
              <div className="image-wrap">
                <SourcePreview path={activeImage.outputPath} />
              </div>
              <div className="meta">
                <code>{activeImage.outputPath}</code>
                <span style={{ flex: 1 }} />
                <span className="rs-tag">替换图 {shot.imageActiveIndex + 1}/{shot.imageResults.length}</span>
              </div>
            </div>
          ) : (
            <div className="rs-empty">还没有可用替换图。请先在「图像替换」步骤生成并选中一张。</div>
          )}

          <div className="rs-field" style={{ marginTop: 10 }}>
            <span>提示词</span>
            <textarea
              rows={5}
              value={shot.videoPrompt || project.settings.videoPromptTemplate}
              onChange={(event) =>
                void onChange((project) => ({
                  ...project,
                  shots: project.shots.map((s) =>
                    s.id === shot.id ? { ...s, videoPrompt: event.target.value } : s,
                  ),
                }))
              }
            />
          </div>
          <div className="rs-row">
            <div className="rs-field" style={{ flex: "0 1 140px" }}>
              <span>时长（秒）</span>
              <input
                type="number"
                min={1}
                max={30}
                value={project.settings.videoDuration}
                onChange={(event) =>
                  void onChange((project) => ({
                    ...project,
                    settings: {
                      ...project.settings,
                      videoDuration: Math.max(1, Math.min(30, Number(event.target.value) || 5)),
                    },
                  }))
                }
              />
            </div>
            <div className="rs-field" style={{ flex: "0 1 160px" }}>
              <span>比例</span>
              <select
                value={project.settings.videoRatio}
                onChange={(event) =>
                  void onChange((project) => ({
                    ...project,
                    settings: { ...project.settings, videoRatio: event.target.value },
                  }))
                }
              >
                {VIDEO_RATIOS.map((ratio) => (
                  <option key={ratio} value={ratio}>
                    {ratio}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="rs-btn primary" disabled={busy || !activeImage} onClick={() => void generate()}>
            {busy ? <span className="rs-spinner" /> : null}
            {shot.videoStatus === "generating" ? "生成中…" : "生成替换视频"}
          </button>
          {shot.videoStatus === "generating" && (
            <p className="rs-muted" style={{ marginTop: 8 }}>
              云端视频生成需要数分钟，请不要关闭窗口。
            </p>
          )}
          {shot.videoError && <div className="rs-banner error">{shot.videoError}</div>}
        </section>

        <section className="rs-panel">
          <h3>视频模型</h3>
          <div className="rs-field">
            <span>中转站（与图片可共用）</span>
            <select
              value={project.settings.providerId}
              onChange={(event) =>
                void onChange((project) => ({
                  ...project,
                  settings: {
                    ...project.settings,
                    providerId: event.target.value,
                    videoModel: "",
                  },
                }))
              }
            >
              <option value="">选择中转站…</option>
              {providers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="rs-field">
            <span>视频模型</span>
            <select
              value={project.settings.videoModel}
              onChange={(event) =>
                void onChange((project) => ({
                  ...project,
                  settings: { ...project.settings, videoModel: event.target.value },
                }))
              }
            >
              <option value="">选择模型…</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            {modelsError && <span className="sub" style={{ color: "#ff9c9c" }}>{modelsError}</span>}
          </div>
          <div className="rs-field">
            <span>或手动填写视频模型 ID</span>
            <input
              value={project.settings.videoModel}
              placeholder="例如 seedance-1.0 / kling-v2 / hailuo-02"
              onChange={(event) =>
                void onChange((project) => ({
                  ...project,
                  settings: { ...project.settings, videoModel: event.target.value },
                }))
              }
            />
          </div>
          <p className="rs-muted">
            提示：视频生成质量取决于中转站模型；含音频的视频模型会自动生成声音。
          </p>
        </section>
      </div>

      <section className="rs-panel">
        <h3>
          视频结果（{shot.label}）
          <span className="hint">点击结果设为当前激活</span>
        </h3>
        <ResultsRow
          items={shot.videoResults}
          activeIndex={shot.videoActiveIndex}
          onActivate={(index) =>
            void onChange((project) => ({
              ...project,
              shots: project.shots.map((s) =>
                s.id === shot.id ? { ...s, videoActiveIndex: index } : s,
              ),
            }))
          }
        />
      </section>
    </div>
  );
}

function SourcePreview({ path }: { path: string }) {
  const [data, setData] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void ensureHostApi()
      .then((host) => host.readImage(path))
      .then((url) => {
        if (!cancelled) setData(url);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);
  if (!data) return <span className="placeholder" style={{ color: "#5a5b61", padding: 30 }}>…</span>;
  return <img src={data} alt="源" />;
}
