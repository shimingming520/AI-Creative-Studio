/**
 * 步骤 1 · 素材设定:基础素材(图片/视频)+ 目标形象(角色与参考形象)管理。
 */
import { useCallback, useEffect, useState } from "react";
import {
  rsId,
  type RsAppearance,
  type RsBaseAsset,
  type RsProject,
  type RsTargetCharacter,
} from "../../shared/replacement-studio";
import { ensureHostApi, errorText } from "./host";

export function StudioMaterialStep({
  project,
  onChange,
}: {
  project: RsProject;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [basePreview, setBasePreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const path = project.base?.keyframePath;
    if (!path) {
      setBasePreview(null);
      return;
    }
    void ensureHostApi()
      .then((host) => host.readImage(path))
      .then((dataUrl) => {
        if (!cancelled) setBasePreview(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setBasePreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [project.base?.keyframePath]);

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

  const chooseBaseImage = () =>
    run("选择图片", async () => {
      const host = await ensureHostApi();
      const picked = await host.pickImages(false);
      if (!picked?.[0]) return;
      const file = picked[0];
      const next: RsBaseAsset = {
        kind: "image",
        path: file.path,
        name: file.name,
        keyframePath: file.path,
        width: 0,
        height: 0,
        durationSec: null,
      };
      await onChange((project) => ({ ...project, base: next, shots: [makeShot(next)] }));
    });

  const chooseBaseVideo = () =>
    run("选择视频", async () => {
      const host = await ensureHostApi();
      const picked = await host.pickVideo();
      if (!picked?.[0]) return;
      const file = picked[0];
      const keyframe = await extractKeyframe(host, file.path, "first");
      const next: RsBaseAsset = {
        kind: "video",
        path: file.path,
        name: file.name,
        keyframePath: keyframe,
        width: 0,
        height: 0,
        durationSec: null,
      };
      await onChange((project) => ({ ...project, base: next, shots: [makeShot(next)] }));
    });

  const reExtract = () =>
    run("抽取关键帧", async () => {
      const base = project.base;
      if (!base || base.kind !== "video") return;
      const host = await ensureHostApi();
      const keyframe = await extractKeyframe(host, base.path, "first");
      const next = { ...base, keyframePath: keyframe };
      await onChange((project) => ({
        ...project,
        base: next,
        shots: project.shots.map((shot, index) =>
          index === 0 ? { ...shot, keyframePath: keyframe } : shot,
        ),
      }));
    });

  const addCharacter = () =>
    run("添加角色", async () => {
      const character: RsTargetCharacter = {
        id: rsId("char"),
        name: `角色${project.targetCharacters.length + 1}`,
        description: "",
        appearances: [],
      };
      await onChange((project) => ({
        ...project,
        targetCharacters: [...project.targetCharacters, character],
      }));
    });

  const addAppearance = async (characterId: string) => {
    await run("添加形象", async () => {
      const host = await ensureHostApi();
      const picked = await host.pickImages(true);
      if (!picked?.length) return;
      const appearances = picked.map((file) => ({
        id: rsId("appa"),
        name: file.name.replace(/\.[^.]+$/, ""),
        imagePath: file.path,
        prompt: "",
      }));
      await onChange((project) => ({
        ...project,
        targetCharacters: project.targetCharacters.map((c) =>
          c.id === characterId
            ? { ...c, appearances: [...c.appearances, ...appearances] }
            : c,
        ),
      }));
    });
  };

  const base = project.base;
  const boundCount = project.sourceCharacters.filter(
    (c) => c.targetCharacterId && c.targetAppearanceId,
  ).length;

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
            基础素材
            <span className="hint">用于人物检测与替换的原图 / 原视频首帧</span>
          </h3>
          {base ? (
            <div className="rs-col">
              <div className="rs-media-card">
                <div className="image-wrap">
                  {basePreview ? (
                    <img src={basePreview} alt={base.name} />
                  ) : (
                    <span className="placeholder" style={{ color: "#5a5b61", padding: 30 }}>
                      正在加载预览…
                    </span>
                  )}
                </div>
                <div className="meta">
                  <code>
                    {base.kind === "video" ? "视频" : "图片"} · {base.name}
                  </code>
                  <span style={{ flex: 1 }} />
                  <button className="rs-btn ghost" disabled={busy} onClick={() => void chooseBaseImage()}>
                    换图片
                  </button>
                  {base.kind === "video" && (
                    <button className="rs-btn ghost" disabled={busy} onClick={() => void reExtract()}>
                      重新抽帧
                    </button>
                  )}
                  <button
                    className="rs-btn ghost"
                    disabled={busy}
                    onClick={() =>
                      void run("清除素材", async () => {
                        await onChange((project) => ({ ...project, base: null, shots: [] }));
                      })
                    }
                  >
                    移除
                  </button>
                </div>
              </div>
              {base.kind === "video" && (
                <p className="rs-muted">
                  已自动抽取首帧作为人物定位与替换生成的基础画面；后续可在「视频替换」步骤基于替换图+原视频生成结果。
                </p>
              )}
            </div>
          ) : (
            <div className="rs-empty">
              <p style={{ marginBottom: 10 }}>
                选择一张图片，或选择一个视频（自动抽取首帧）作为替换基础素材。
              </p>
              <div className="rs-row" style={{ justifyContent: "center" }}>
                <button className="rs-btn primary" disabled={busy} onClick={() => void chooseBaseImage()}>
                  选择图片…
                </button>
                <button className="rs-btn" disabled={busy} onClick={() => void chooseBaseVideo()}>
                  选择视频…
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rs-panel">
          <h3>
            目标形象
            <span className="hint">替换后的人物参考图（可多形象）</span>
          </h3>
          {project.targetCharacters.length === 0 ? (
            <div className="rs-empty">
              <p style={{ marginBottom: 10 }}>还没有目标角色。添加一个人物角色并上传它的参考形象。</p>
              <button className="rs-btn primary" disabled={busy} onClick={() => void addCharacter()}>
                ＋ 新建角色
              </button>
            </div>
          ) : (
            <div className="rs-col">
              {project.targetCharacters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  busy={busy}
                  onAddAppearance={() => void addAppearance(character.id)}
                  onChange={(next) =>
                    void onChange((project) => ({
                      ...project,
                      targetCharacters: project.targetCharacters.map((c) =>
                        c.id === character.id ? next : c,
                      ),
                    }))
                  }
                  onRemove={() =>
                    void onChange((project) => ({
                      ...project,
                      targetCharacters: project.targetCharacters.filter((c) => c.id !== character.id),
                      sourceCharacters: project.sourceCharacters.map((source) =>
                        source.targetCharacterId === character.id
                          ? { ...source, targetCharacterId: null, targetAppearanceId: null }
                          : source,
                      ),
                    }))
                  }
                />
              ))}
              <button className="rs-btn" disabled={busy} onClick={() => void addCharacter()}>
                ＋ 新建角色
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="rs-panel">
        <h3>
          当前状态
          <span className="hint">完成素材设定后进入「人物绑定」</span>
        </h3>
        <div className="rs-row">
          <span className="rs-tag">{base ? `基础素材: ${base.name}` : "未设置基础素材"}</span>
          <span className="rs-tag">{project.sourceCharacters.length} 个人物框</span>
          <span className="rs-tag">{project.targetCharacters.length} 个目标角色</span>
          <span className="rs-tag">{boundCount} 个已绑定人物</span>
        </div>
      </section>
    </div>
  );
}

function makeShot(base: RsBaseAsset) {
  return {
    id: rsId("shot"),
    label: "镜头 01",
    keyframePath: base.keyframePath,
    sourceVideoPath: base.kind === "video" ? base.path : null,
    imagePrompt: "",
    imageResults: [],
    imageActiveIndex: 0,
    imageStatus: "idle" as const,
    imageError: null,
    videoPrompt: "",
    videoResults: [],
    videoActiveIndex: 0,
    videoStatus: "idle" as const,
    videoError: null,
  };
}

async function extractKeyframe(
  host: Awaited<ReturnType<typeof ensureHostApi>>,
  videoPath: string,
  position: "first" | "last",
): Promise<string> {
  const result = (await host.extractFrame({
    file: videoPath,
    outputDir: "",
    position,
  })) as unknown as { files?: string[]; ok?: boolean; outputPath?: string };
  const output = result?.files?.[0] ?? result?.outputPath;
  if (!output || typeof output !== "string") {
    throw new Error("抽取视频首帧失败（可检查视频文件是否可读）");
  }
  return output;
}

function CharacterCard({
  character,
  busy,
  onAddAppearance,
  onChange,
  onRemove,
}: {
  character: RsTargetCharacter;
  busy: boolean;
  onAddAppearance: () => void;
  onChange: (next: RsTargetCharacter) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ border: "1px solid #26262b", borderRadius: 8, padding: 10, background: "#131316" }}>
      <div className="rs-row" style={{ alignItems: "center" }}>
        <input
          style={{ flex: "0 1 200px", border: "1px solid #34343a", background: "#1d1d21", color: "#e8e9ec", borderRadius: 6, padding: "6px 9px" }}
          value={character.name}
          onChange={(event) => onChange({ ...character, name: event.target.value })}
          placeholder="角色名称"
        />
        <span className="rs-tag">{character.appearances.length} 个形象</span>
        <span style={{ flex: 1 }} />
        <button className="rs-btn ghost" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "收起" : "展开"}
        </button>
        <button className="rs-btn ghost danger" onClick={onRemove}>
          删除
        </button>
      </div>
      {expanded && (
        <div style={{ marginTop: 8 }}>
          <div className="rs-field">
            <span>角色描述（可选，用于补充提示词）</span>
            <textarea
              rows={2}
              value={character.description}
              onChange={(event) => onChange({ ...character, description: event.target.value })}
              placeholder="例如：年轻女性，黑色长发，红色连衣裙"
            />
          </div>
          <div className="rs-results" style={{ paddingBottom: 4 }}>
            {character.appearances.map((appearance) => (
              <AppearanceCard
                key={appearance.id}
                appearance={appearance}
                onRemove={() =>
                  onChange({
                    ...character,
                    appearances: character.appearances.filter((a) => a.id !== appearance.id),
                  })
                }
                onChange={(next) =>
                  onChange({
                    ...character,
                    appearances: character.appearances.map((a) => (a.id === appearance.id ? next : a)),
                  })
                }
              />
            ))}
            <button className="rs-btn" disabled={busy} onClick={onAddAppearance}>
              ＋ 添加形象图
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AppearanceCard({
  appearance,
  onChange,
  onRemove,
}: {
  appearance: RsAppearance;
  onChange: (next: RsAppearance) => void;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!appearance.imagePath) return;
    void ensureHostApi()
      .then((host) => host.readImage(appearance.imagePath!))
      .then((dataUrl) => {
        if (!cancelled) setPreview(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [appearance.imagePath]);

  return (
    <div className="rs-result" style={{ width: 180 }}>
      <div className="media" style={{ height: 110 }}>
        {preview ? (
          <img src={preview} alt={appearance.name} />
        ) : (
          <span className="placeholder">无图片</span>
        )}
      </div>
      <div style={{ padding: 6 }}>
        <input
          style={{ width: "100%", boxSizing: "border-box", border: "1px solid #34343a", background: "#1d1d21", color: "#e8e9ec", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}
          value={appearance.name}
          onChange={(event) => onChange({ ...appearance, name: event.target.value })}
          placeholder="形象名称"
        />
        <input
          style={{ width: "100%", boxSizing: "border-box", marginTop: 6, border: "1px solid #34343a", background: "#1d1d21", color: "#e8e9ec", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}
          value={appearance.prompt}
          onChange={(event) => onChange({ ...appearance, prompt: event.target.value })}
          placeholder="形象补充描述（可选）"
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
          <button className="rs-btn ghost danger" onClick={onRemove}>
            移除
          </button>
        </div>
      </div>
    </div>
  );
}
