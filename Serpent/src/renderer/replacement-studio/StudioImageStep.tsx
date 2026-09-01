/**
 * 步骤 3 · 图像替换:多图引导生成(原图 + 位置标注图 + 目标形象参考图)。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildRsImagePrompt,
  rsId,
  type RsBindingLine,
  type RsGeneratedItem,
  type RsProject,
  type RsShot,
} from "../../shared/replacement-studio";
import { ensureHostApi, errorText, type RsProviderInfo } from "./host";
import { guideBoxesForCharacters, renderGuideImage } from "./guide-image";

const IMAGE_SIZES = ["auto", "1024x1024", "1152x896", "896x1152", "1536x1024", "1024x1536"];
const IMAGE_QUALITIES = ["auto", "standard", "high"];

export function StudioImageStep({
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
  const keyframePath = shot?.keyframePath ?? null;

  useEffect(() => {
    void ensureHostApi()
      .then((host) => host.listProviders())
      .then((list) => setProviders((list || []).filter((p) => p.enabled && p.hasApiKey)))
      .catch(() => void 0);
  }, []);

  const provider = providers.find((p) => p.id === project.settings.providerId) ?? null;

  useEffect(() => {
    const providerId = project.settings.providerId;
    if (!providerId) {
      setModels([]);
      return;
    }
    let cancelled = false;
    setModelsError("");
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
          return { character, target, appearance };
        })
        .filter((item) => item.target && item.appearance),
    [project.sourceCharacters, project.targetCharacters],
  );

  const promptPreview = useMemo(() => {
    if (!shot) return "";
    const lines = buildBindings(bound, 3);
    return buildRsImagePrompt({
      template: project.settings.imagePromptTemplate,
      shotLabel: shot.label,
      bindings: lines,
    });
  }, [shot, bound, project.settings.imagePromptTemplate]);

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
    run("生成替换图", async () => {
      if (!shot) return;
      if (!provider) throw new Error("请选择中转站（带图片生成能力，需已配置 API Key）");
      if (!project.settings.imageModel.trim()) throw new Error("请选择/填写图片生成模型");
      if (bound.length === 0) throw new Error("请先在「人物绑定」中为人物绑定目标形象");
      const host = await ensureHostApi();

      // 1) 原图
      const keyFrameData = await host.readImage(keyframePath!).catch(() => null);
      if (!keyFrameData) throw new Error("无法读取基础图，请检查文件是否存在");

      // 2) 位置标注图(包含全部人物框)
      const boxes = guideBoxesForCharacters(project.sourceCharacters);
      const guideDataUrl = boxes.length
        ? await renderGuideImage({ imageDataUrl: keyFrameData, boxes })
        : keyFrameData;
      const saved = await host.saveDataImage({ dataUrl: guideDataUrl, name: "guide" });

      // 3) 目标形象参考图(按绑定顺序去重)
      const appearancePaths: string[] = [];
      const bindings = bound.map((item, index) => {
        const path = item.appearance!.imagePath;
        let imageIndex: number | null = null;
        if (path) {
          const existing = appearancePaths.indexOf(path);
          imageIndex = existing >= 0 ? existing + 3 : appearancePaths.length + 3;
          if (existing < 0) appearancePaths.push(path);
        }
        const letter = item.character.label.replace(/^人物/, "") || String.fromCharCode(65 + index);
        return {
          letter,
          label: item.character.label,
          imageIndex,
          scope: item.character.scope,
          characterName: item.target!.name,
          appearanceName: item.appearance!.name || null,
          appearancePrompt: item.appearance!.prompt,
        } satisfies RsBindingLine;
      });

      const prompt = buildRsImagePrompt({
        template: project.settings.imagePromptTemplate,
        shotLabel: shot.label,
        bindings,
      });

      const references = [
        { kind: "image" as const, path: shot.keyframePath },
        { kind: "image" as const, path: saved.path },
        ...appearancePaths.map((path) => ({ kind: "image" as const, path })),
      ];
      if (references.length < bound.filter((b) => b.appearance!.imagePath).length + 2) {
        // 参考图数量少于期望:文案描述形象仍然可生成,不打断
      }

      await onChange((project) => ({
        ...project,
        shots: project.shots.map((s) =>
          s.id === shot.id
            ? { ...s, imagePrompt: prompt, imageStatus: "generating" as const, imageError: null }
            : s,
        ),
      }));

      const result = await host.generateImage({
        providerId: provider.id,
        model: project.settings.imageModel.trim(),
        prompt,
        size: project.settings.imageSize !== "auto" ? project.settings.imageSize : undefined,
        quality: project.settings.imageQuality !== "auto" ? project.settings.imageQuality : undefined,
        references,
      });

      const item: RsGeneratedItem = {
        id: rsId("img"),
        outputPath: result.outputPath,
        outputUrl: result.outputUrl,
        createdAt: result.createdAt,
        prompt,
        model: result.model || project.settings.imageModel,
        kind: "image",
      };
      await onChange((project) => ({
        ...project,
        shots: project.shots.map((s) =>
          s.id === shot.id
            ? {
                ...s,
                imageResults: [...s.imageResults, item],
                imageActiveIndex: s.imageResults.length,
                imageStatus: "done" as const,
                imageError: null,
              }
            : s,
        ),
        history: [
          {
            id: item.id,
            kind: "image" as const,
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
    return <div className="rs-banner warn">请先在「素材设定」中选择基础素材。</div>;
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
            替换提示词
            <span className="hint">生成前可修改;参考图与原位置关系由程序自动组装</span>
          </h3>
          <div className="rs-field">
            <span>提示词（{shot.label}）</span>
            <textarea
              rows={9}
              value={shot.imagePrompt || promptPreview}
              onChange={(event) =>
                void onChange((project) => ({
                  ...project,
                  shots: project.shots.map((s) =>
                    s.id === shot.id ? { ...s, imagePrompt: event.target.value } : s,
                  ),
                }))
              }
            />
            <span className="sub">
              模板变量：{"{bindings}"} 人物绑定 · {"{scopeLines}"} 替换范围 · {"{shot}"} 镜头名
            </span>
          </div>

          <div className="rs-field">
            <span>生成参数</span>
            <select
              value={project.settings.imageSize}
              onChange={(event) =>
                void onChange((project) => ({
                  ...project,
                  settings: { ...project.settings, imageSize: event.target.value },
                }))
              }
            >
              {IMAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size === "auto" ? "自动（模型默认）" : size}
                </option>
              ))}
            </select>
          </div>
          <div className="rs-field">
            <span>质量</span>
            <select
              value={project.settings.imageQuality}
              onChange={(event) =>
                void onChange((project) => ({
                  ...project,
                  settings: { ...project.settings, imageQuality: event.target.value },
                }))
              }
            >
              {IMAGE_QUALITIES.map((quality) => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>
          </div>

          <div className="rs-row">
            <button
              className="rs-btn primary"
              disabled={busy || !provider}
              onClick={() => void generate()}
            >
              {busy ? <span className="rs-spinner" /> : null}
              {shot.imageStatus === "generating" ? "生成中…" : "生成替换图"}
            </button>
            {bound.length === 0 && (
              <span className="rs-muted">还未绑定人物形象（在「人物绑定」步骤完成）</span>
            )}
          </div>
          {shot.imageStatus === "generating" && (
            <div style={{ marginTop: 8 }}>
              <div className="rs-progress">
                <div className="fill" style={{ width: "100%" }} />
              </div>
              <p className="rs-muted" style={{ marginTop: 6 }}>
                云端图片生成通常需要 20 秒 ~ 数分钟，期间可切换其它步骤，任务完成后结果自动出现在下方。
              </p>
            </div>
          )}
          {shot.imageError && <div className="rs-banner error">{shot.imageError}</div>}
        </section>

        <section className="rs-panel">
          <h3>生成模型</h3>
          <div className="rs-field">
            <span>中转站 {provider ? `（${provider.name}）` : ""}</span>
            <select
              value={project.settings.providerId}
              onChange={async (event) => {
                const providerId = event.target.value;
                const next = {
                  ...project.settings,
                  providerId,
                  imageModel: "",
                  videoModel: "",
                };
                await onChange((project) => ({ ...project, settings: next }));
              }}
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
            <span>图片模型（需支持图片编辑/多图输入）</span>
            <select
              value={project.settings.imageModel}
              onChange={(event) =>
                void onChange((project) => ({
                  ...project,
                  settings: { ...project.settings, imageModel: event.target.value },
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
            {models.length === 0 && !modelsError && (
              <span className="sub">模型列表为空时可手动填写模型 ID。</span>
            )}
          </div>
          <div className="rs-field">
            <span>或手动填写模型 ID</span>
            <input
              value={project.settings.imageModel}
              placeholder="例如 gpt-image-1 / seedream-4.0"
              onChange={(event) =>
                void onChange((project) => ({
                  ...project,
                  settings: { ...project.settings, imageModel: event.target.value },
                }))
              }
            />
          </div>

          <h3 style={{ marginTop: 8 }}>本次参考图顺序</h3>
          <div className="rs-col" style={{ gap: 6 }}>
            <div className="rs-tag">图像1 = 原图（{shot.keyframePath.split(/[\\/]/).pop()}）</div>
            <div className="rs-tag">图像2 = 位置标注图（人物字母与彩色边框）</div>
            {bound.map((item, index) => {
              const path = item.appearance!.imagePath;
              return (
                <div className="rs-tag" key={item.character.id}>
                  {item.character.label} → {item.target!.name}
                  {path ? `（参考图${index + 3}: ${path.split(/[\\/]/).pop()}）` : "（仅文字描述）"}
                </div>
              );
            })}
          </div>
          <p className="rs-muted" style={{ marginTop: 8 }}>
            若中转站模型对多图输入支持有限，可仅保留原图+标注图并依赖文字绑定说明。
          </p>
        </section>
      </div>

      <section className="rs-panel">
        <h3>
          替换结果（{shot.label}）
          <span className="hint">点击结果设为当前激活 · 视频替换默认以此为源</span>
        </h3>
        <ResultsRow items={shot.imageResults} activeIndex={shot.imageActiveIndex} onActivate={(index) =>
          void onChange((project) => ({
            ...project,
            shots: project.shots.map((s) =>
              s.id === shot.id ? { ...s, imageActiveIndex: index } : s,
            ),
          }))
        } />
      </section>
    </div>
  );
}

function buildBindings(
  bound: {
    character: { label: string; scope: RsBindingLine["scope"] };
    target: { name: string } | null;
    appearance: { name: string; prompt: string; imagePath: string | null } | null;
  }[],
  startIndex: number,
): RsBindingLine[] {
  return bound.map((item, index) => {
    const path = item.appearance?.imagePath ?? null;
    return {
      letter: item.character.label.replace(/^人物/, "") || String.fromCharCode(65 + index),
      label: item.character.label,
      imageIndex: path ? startIndex + index : null,
      scope: item.character.scope,
      characterName: item.target?.name ?? "",
      appearanceName: item.appearance?.name || null,
      appearancePrompt: item.appearance?.prompt ?? "",
    };
  });
}

export function ResultsRow({
  items,
  activeIndex,
  onActivate,
  onRemove,
}: {
  items: RsGeneratedItem[];
  activeIndex: number;
  onActivate: (index: number) => void;
  onRemove?: (item: RsGeneratedItem) => void;
}) {
  const [previews, setPreviews] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const missing = items.filter((item) => !(item.outputPath in previews));
    if (missing.length === 0) return;
    let cancelled = false;
    void ensureHostApi()
      .then((host) =>
        Promise.all(
          missing.map(async (item) => {
            const url = item.kind === "image" ? await host.readImage(item.outputPath).catch(() => null) : null;
            return [item.id, url] as const;
          }),
        ),
      )
      .then((entries) => {
        if (cancelled) return;
        setPreviews((current) => {
          const next = { ...current };
          for (const [id, url] of entries) next[id] = url ?? null;
          return next;
        });
      })
      .catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [items, previews]);

  if (items.length === 0) {
    return <p className="rs-muted">还没有生成结果。点击「生成替换图」开始。</p>;
  }

  return (
    <div className="rs-results">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`rs-result${index === activeIndex ? " active" : ""}`}
          onClick={() => onActivate(index)}
        >
          <div className="media">
            {item.kind === "image" ? (
              previews[item.id] ? (
                <img src={previews[item.id]!} alt="result" />
              ) : (
                <span className="placeholder">…</span>
              )
            ) : (
              <video src={item.outputUrl} controls />
            )}
          </div>
          <div className="meta">
            <span title={item.model}>{item.model}</span>
            <code title={item.outputPath}>{item.outputPath.split(/[\\/]/).pop()}</code>
          </div>
          {onRemove && (
            <div style={{ padding: "0 9px 8px", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="rs-btn ghost danger"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(item);
                }}
              >
                移除
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function useShowItem() {
  return async (path: string) => {
    const host = await ensureHostApi();
    await host.showItem(path).catch(() => void 0);
  };
}
