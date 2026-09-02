/**
 * 步骤 2/3 · 图像替换 & 视频替换 — 四栏布局:
 * 左=目标素材栏 中=舞台(检测框/结果预览/镜头导航)+镜头时间线 右=生成面板(绑定/提示词/模型/生成)。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildRsImagePrompt,
  buildRsVideoPrompt,
  findDuplicateBindings,
  iterationReferenceLine,
  letterAt,
  parseDetectedPeople,
  rsId,
  type RsBindingLine,
  type RsGeneratedItem,
  type RsOrientation,
  type RsPerson,
  type RsProject,
  type RsShot,
  type RsSourceCharacter,
} from "../../shared/replacement-studio";
import { ensureHostApi, errorText, type RsProviderInfo } from "./host";
import { guideBoxesForCharacters, renderGuideImage } from "./guide-image";
import { StudioCutEditor } from "./StudioCutEditor";
import {
  BindingList,
  GenerationPanel,
  ResultPreviewOverlay,
  ShotTimeline,
  StageCanvas,
  TargetRail,
  type RsAssetTab,
} from "./StudioParts";

const IMAGE_SIZES = ["auto", "1024x1024", "1152x896", "896x1152", "1536x1024", "1024x1536"];
const IMAGE_QUALITIES = ["auto", "standard", "high"];
const VIDEO_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4"];

export function StudioImageStep({
  project,
  onChange,
  selectedShot,
  onSelectShot,
}: {
  project: RsProject;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
  selectedShot: RsShot | null;
  onSelectShot: (shotId: string) => void;
}) {
  return (
    <ProductionLayout
      mode="image"
      project={project}
      onChange={onChange}
      selectedShot={selectedShot}
      onSelectShot={onSelectShot}
    />
  );
}

export function StudioVideoStep({
  project,
  onChange,
  selectedShot,
  onSelectShot,
}: {
  project: RsProject;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
  selectedShot: RsShot | null;
  onSelectShot: (shotId: string) => void;
}) {
  return (
    <ProductionLayout
      mode="video"
      project={project}
      onChange={onChange}
      selectedShot={selectedShot}
      onSelectShot={onSelectShot}
    />
  );
}

// ---------------------------------------------------------------------------
// 共享四栏布局
// ---------------------------------------------------------------------------
function ProductionLayout({
  mode,
  project,
  onChange,
  selectedShot,
  onSelectShot,
}: {
  mode: "image" | "video";
  project: RsProject;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
  selectedShot: RsShot | null;
  onSelectShot: (shotId: string) => void;
}) {
  const [hook, force] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [providers, setProviders] = useState<RsProviderInfo[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [modelsError, setModelsError] = useState("");
  const [tab, setTab] = useState<RsAssetTab>("character");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [detectBusy, setDetectBusy] = useState(false);
  const [keyframeData, setKeyframeData] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"first-frame" | "character-ref">("first-frame");

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
        setModelsError(list.length === 0 && result.error ? result.error : "");
      })
      .catch((reason) => {
        if (!cancelled) setModelsError(errorText(reason));
      });
    return () => {
      cancelled = true;
    };
  }, [project.settings.providerId]);

  useEffect(() => {
    let cancelled = false;
    const path = selectedShot?.keyframePath;
    if (!path) {
      setKeyframeData(null);
      return;
    }
    void ensureHostApi()
      .then((host) => host.readImage(path))
      .then((url) => {
        if (!cancelled) setKeyframeData(url);
      })
      .catch(() => {
        if (!cancelled) setKeyframeData(null);
      });
    return () => {
      cancelled = true;
      void hook;
    };
  }, [selectedShot?.keyframePath, hook]);

  const shotIndex = project.shots.findIndex((s) => s.id === selectedShot?.id);
  const shot = project.shots[shotIndex] ?? null;

  const shotBound = useMemo(() => {
    if (!shot) return [];
    return shot.people
      .map((person) => {
        const cluster = project.sourceCharacters.find((c) => c.id === person.sourceCharacterId);
        if (!cluster?.targetCharacterId || !cluster.targetAppearanceId) return null;
        const character = project.characters.find((c) => c.id === cluster.targetCharacterId) ?? null;
        const appearance = character?.appearances.find((a) => a.id === cluster.targetAppearanceId) ?? null;
        return { person, cluster: cluster!, character, appearance };
      })
      .filter((item) => item !== null) as {
      person: { letter: string; label: string; bbox: { x: number; y: number; w: number; h: number } };
      cluster: { scope: RsBindingLine["scope"] };
      character: { name: string } | null;
      appearance: { name: string; prompt: string; imagePath: string | null } | null;
    }[];
  }, [shot, project.sourceCharacters, project.characters]);

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

  const prevShot = () => {
    const prev = project.shots[Math.max(0, shotIndex - 1)];
    if (prev) onSelectShot(prev.id);
  };
  const nextShot = () => {
    const next = project.shots[Math.min(project.shots.length - 1, shotIndex + 1)];
    if (next) onSelectShot(next.id);
  };

  // -------- 生成(单镜头) --------
  const generate = () =>
    run(mode === "image" ? "生成替换图" : "生成替换视频", async () => {
      if (!shot) return;
      const host = await ensureHostApi();
      if (mode === "image") {
        const duplicates = findDuplicateBindings(project, shot);
        if (duplicates.length > 0) {
          throw new Error(`同一镜头内角色不能重复绑定：${duplicates.join("、")}（请先在身份绑定中调整）`);
        }
        await generateImageForShot(host, project, onChange, shot, shotBound);
      } else {
        await generateVideoForShot(host, project, onChange, shot, shotBound, inputMode);
      }
      force((v) => v + 1);
    });

  const regenerateAll = () =>
    run("批量生成", async () => {
      const host = await ensureHostApi();
      for (const s of project.shots) {
        const bound = s.people
          .map((person) => {
            const cluster = project.sourceCharacters.find((c) => c.id === person.sourceCharacterId);
            if (!cluster?.targetCharacterId || !cluster.targetAppearanceId) return null;
            const character = project.characters.find((c) => c.id === cluster.targetCharacterId) ?? null;
            const appearance = character?.appearances.find((a) => a.id === cluster.targetAppearanceId) ?? null;
            return { person, cluster: cluster!, character, appearance };
          })
          .filter((item) => item !== null) as Parameters<typeof generateImageForShot>[4];
        if (bound.length === 0) continue;
        try {
          await onChange((p) => ({
            ...p,
            shots: p.shots.map((x) =>
              x.id === s.id ? { ...x, imageStatus: "generating" as const, imageError: null } : x,
            ),
          }));
          if (mode === "image") await generateImageForShot(host, project, onChange, s, bound);
          else await generateVideoForShot(host, project, onChange, s, bound, inputMode);
        } catch (reason) {
          await onChange((p) => ({
            ...p,
            shots: p.shots.map((x) =>
              x.id === s.id ? { ...x, imageStatus: "error" as const, imageError: errorText(reason) } : x,
            ),
          }));
        }
      }
      force((v) => v + 1);
    });

  // -------- 重新检测(当前镜头) --------
  const redetect = () =>
    run("重新检测", async () => {
      if (!shot?.keyframePath) throw new Error("该镜头还没有关键帧");
      if (!project.settings.detectProviderId || !project.settings.detectModel.trim())
        throw new Error("请先在素材设定配置检测中转站与模型");
      const host = await ensureHostApi();
      setDetectBusy(true);
      try {
        const result = await host.detectPeople({
          providerId: project.settings.detectProviderId,
          model: project.settings.detectModel.trim(),
          prompt: project.settings.detectPrompt,
          imagePath: shot.keyframePath,
        });
        const detected = parseDetectedPeople(result?.text || "");
        const people: RsPerson[] = detected.map((d, index) => ({
          id: rsId("ps"),
          letter: letterAt(RS_LETTER_IDX(d.labelHint, index)),
          label: `人物${letterAt(RS_LETTER_IDX(d.labelHint, index))}`,
          bbox: d.bbox,
          description: d.description,
          confidence: d.confidence,
          method: "auto",
          orientation: "unknown",
          sourceCharacterId: null,
        }));
        await onChange((p) => ({
          ...p,
          shots: p.shots.map((s) =>
            s.id === shot.id ? { ...s, people, detectionStatus: "done" as const, detectionError: null } : s,
          ),
        }));
      } finally {
        setDetectBusy(false);
      }
    });

  // -------- 删除镜头 --------
  const deleteShots = async (shotIds: string[]) => {
    setDetectBusy(true);
    try {
      await onChange((p) => ({
        ...p,
        shots: p.shots.filter((s) => !shotIds.includes(s.id)),
        sourceCharacters: p.sourceCharacters.filter((c) =>
          c.personIds.some((pid) =>
            p.shots.some((s) => !shotIds.includes(s.id) && s.people.some((person) => person.id === pid)),
          ),
        ),
      }));
    } finally {
      setDetectBusy(false);
    }
  };

  // -------- 素材库管理 --------
  const addCharacter = () =>
    run("新建角色", async () => {
      await onChange((p) => ({
        ...p,
        characters: [
          ...p.characters,
          { id: rsId("char"), name: `角色${p.characters.length + 1}`, role: "", description: "", appearances: [], boundLetters: [] },
        ],
      }));
    });
  const addScene = () =>
    run("新建场景", async () => {
      const host = await ensureHostApi();
      const picked = await host.pickImages(false);
      const file = picked?.[0];
      if (!file) return;
      await onChange((p) => ({
        ...p,
        scenes: [...p.scenes, { id: rsId("scene"), name: file.name.replace(/\.[^.]+$/, ""), description: "", imagePath: file.path }],
      }));
    });
  const addAppearance = (characterId: string) =>
    run("添加形象", async () => {
      const host = await ensureHostApi();
      const picked = await host.pickImages(true);
      if (!picked?.length) return;
      const appearances = picked.map((f) => ({ id: rsId("appa"), name: f.name.replace(/\.[^.]+$/, ""), imagePath: f.path, prompt: "" }));
      await onChange((p) => ({
        ...p,
        characters: p.characters.map((c) => (c.id === characterId ? { ...c, appearances: [...c.appearances, ...appearances] } : c)),
      }));
    });
  const removeCard = (key: string) => {
    const [kind, id] = key.split(":");
    void onChange((p) =>
      kind === "character"
        ? {
            ...p,
            characters: p.characters.filter((c) => c.id !== id),
            sourceCharacters: p.sourceCharacters.map((c) =>
              c.targetCharacterId === id ? { ...c, targetCharacterId: null, targetAppearanceId: null } : c,
            ),
          }
        : kind === "scene"
          ? { ...p, scenes: p.scenes.filter((s) => s.id !== id) }
          : p,
    );
  };

  // -------- 结果操作 --------
  const showItem = async (item: RsGeneratedItem) => {
    const host = await ensureHostApi();
    await host.showItem(item.outputPath).catch(() => void 0);
  };

  if (!shot) {
    return (
      <div className="rs-banner warn" style={{ margin: 16 }}>
        没有可用的镜头。请先回到「素材设定」完成智能裁剪与检测。
      </div>
    );
  }

  const results = mode === "image" ? shot.imageResults : shot.videoResults;
  const activeIndex = mode === "image" ? shot.imageActiveIndex : shot.videoActiveIndex;
  const activeItem = results[activeIndex] ?? null;

  return (
    <div className="rs-four-panel production" data-mode={mode}>
      <TargetRail
        project={project}
        activeTab={tab}
        onTab={setTab}
        selectedCard={selectedCard}
        onSelectCard={setSelectedCard}
        onAddCharacter={() => void addCharacter()}
        onAddScene={() => void addScene()}
        onAddAppearance={(id) => void addAppearance(id)}
        onRemoveCard={removeCard}
      />
      <div className="rs-center">
        <div className="rs-stage-col">
          {mode === "image" ? (
            <StageCanvas
              shot={shot}
              imageData={keyframeData}
              clusters={project.sourceCharacters}
              characters={project.characters}
              selectedPersonId={selectedPersonId}
              onSelectPerson={setSelectedPersonId}
              onPersonChanged={(personId, patch) =>
                void onChange((p) => ({
                  ...p,
                  shots: p.shots.map((s) =>
                    s.id === shot.id
                      ? {
                          ...s,
                          people: s.people.map((person) =>
                            person.id === personId ? { ...person, ...patch } : person,
                          ),
                        }
                      : s,
                  ),
                }))
              }
              onAddManualPerson={(bbox) =>
                void onChange((p) => ({
                  ...p,
                  shots: p.shots.map((s) =>
                    s.id === shot.id
                      ? {
                          ...s,
                          people: [
                            ...s.people,
                            {
                              id: rsId("ps"),
                              letter: letterAt(s.people.length),
                              label: `人物${letterAt(s.people.length)}`,
                              bbox,
                              description: "手动框选",
                              confidence: null,
                              method: "manual" as const,
                              orientation: "unknown" as const,
                              sourceCharacterId: null,
                            },
                          ],
                        }
                      : s,
                  ),
                }))
              }
              onRemovePerson={(personId) => {
                if (selectedPersonId === personId) setSelectedPersonId(null);
                void onChange((p) => ({
                  ...p,
                  shots: p.shots.map((s) =>
                    s.id === shot.id
                      ? { ...s, people: s.people.filter((person) => person.id !== personId) }
                      : s,
                  ),
                }));
              }}
              onBindPersonByDrag={(personId, characterId, appearanceId) =>
                void onChange((p) => {
                  let targetClusterId: string | null = null;
                  for (const s of p.shots) {
                    const person = s.people.find((pp) => pp.id === personId);
                    if (person) {
                      if (person.sourceCharacterId) {
                        targetClusterId = person.sourceCharacterId;
                        break;
                      }
                      const cluster: RsSourceCharacter = {
                        id: rsId("sc2"),
                        letter: person.letter,
                        label: person.label,
                        personIds: [person.id],
                        description: person.description,
                        scope: "full-person",
                        targetCharacterId: characterId,
                        targetAppearanceId: appearanceId,
                      };
                      targetClusterId = cluster.id;
                      return {
                        ...p,
                        sourceCharacters: [...p.sourceCharacters, cluster],
                        shots: p.shots.map((s2) => ({
                          ...s2,
                          people: s2.people.map((pp) =>
                            pp.id === personId ? { ...pp, sourceCharacterId: cluster.id } : pp,
                          ),
                        })),
                      };
                    }
                  }
                  return targetClusterId
                    ? {
                        ...p,
                        sourceCharacters: p.sourceCharacters.map((c) =>
                          c.id === targetClusterId
                            ? { ...c, targetCharacterId: characterId, targetAppearanceId: appearanceId }
                            : c,
                        ),
                      }
                    : p;
                })
              }
              onPrev={prevShot}
              onNext={nextShot}
              canPrev={shotIndex > 0}
              canNext={shotIndex < project.shots.length - 1}
            />
          ) : (
            <VideoStage
              shot={shot}
              project={project}
              inputMode={inputMode}
              setInputMode={setInputMode}
              onPrev={prevShot}
              onNext={nextShot}
              canPrev={shotIndex > 0}
              canNext={shotIndex < project.shots.length - 1}
            />
          )}
        </div>
        {project.sources[0]?.kind === "video" && shot.sourceId && (
          <StudioCutEditor
            project={project}
            shot={shot}
            source={project.sources.find((s) => s.id === shot.sourceId) ?? project.sources[0] ?? null}
            onChange={onChange}
            onSelectShot={onSelectShot}
          />
        )}
        <ShotTimeline
          shots={project.shots}
          selectedShotId={shot.id}
          onSelectShot={onSelectShot}
          onDetectAll={() => void redetect()}
          onDeleteShots={(ids) => void deleteShots(ids)}
          busy={busy}
          detectBusy={detectBusy}
        />
      </div>
      <GenerationPanel
        title={mode === "image" ? "图像替换" : "视频替换"}
        preview={
          <ResultPreviewOverlay
            item={activeItem}
            index={activeIndex}
            total={results.length}
            items={results}
            onPrev={() =>
              void onChange((p) => ({
                ...p,
                shots: p.shots.map((s) =>
                  s.id === shot.id
                    ? { ...s, [mode === "image" ? "imageActiveIndex" : "videoActiveIndex"]: Math.max(0, activeIndex - 1) }
                    : s,
                ),
              }))
            }
            onNext={() =>
              void onChange((p) => ({
                ...p,
                shots: p.shots.map((s) =>
                  s.id === shot.id
                    ? { ...s, [mode === "image" ? "imageActiveIndex" : "videoActiveIndex"]: Math.min(results.length - 1, activeIndex + 1) }
                    : s,
                ),
              }))
            }
            onSelectIndex={(index) =>
              void onChange((p) => ({
                ...p,
                shots: p.shots.map((s) =>
                  s.id === shot.id
                    ? { ...s, [mode === "image" ? "imageActiveIndex" : "videoActiveIndex"]: index }
                    : s,
                ),
              }))
            }
            onSetReference={
              mode === "image"
                ? (item) =>
                    void onChange((p) => ({
                      ...p,
                      shots: p.shots.map((s) =>
                        s.id === shot.id ? { ...s, referenceImagePath: item.outputPath } : s,
                      ),
                    }))
                : undefined
            }
            onRemove={(item) =>
              void onChange((p) => ({
                ...p,
                shots: p.shots.map((s) =>
                  s.id === shot.id
                    ? {
                        ...s,
                        [mode === "image" ? "imageResults" : "videoResults"]: (mode === "image" ? s.imageResults : s.videoResults).filter(
                          (entry) => entry.id !== item.id,
                        ),
                        [mode === "image" ? "imageActiveIndex" : "videoActiveIndex"]: Math.max(
                          0,
                          Math.min(
                            activeIndex - 1,
                            (mode === "image" ? s.imageResults : s.videoResults).length - 2,
                          ),
                        ),
                      }
                    : s,
                ),
              }))
            }
            onDownload={(item) => void showItem(item)}
          />
        }
        footer={
          <div className="rs-row" style={{ justifyContent: "flex-end" }}>
            {shotBound.length > 0 && results.length === 0 && (
              <button className="rs-btn" disabled={busy} onClick={() => void regenerateAll()}>
                批量生成（{project.shots.length}）
              </button>
            )}
            <button className="rs-btn primary" disabled={busy} onClick={() => void generate()}>
              {busy ? <span className="rs-spinner" /> : null}
              {mode === "image" ? (shot.imageStatus === "generating" ? "生成中…" : "生成替换图") : shot.videoStatus === "generating" ? "生成中…" : "生成替换视频"}
            </button>
          </div>
        }
      >
        {message && (
          <div className="rs-banner error">
            {message}
            <button className="rs-btn ghost" onClick={() => setMessage("")}>
              关闭
            </button>
          </div>
        )}
        <section className="rs-panel">
          <h3>身份绑定</h3>
          <BindingList project={project} onChange={onChange} compact />
        </section>
        <section className="rs-panel">
          <h3>提示词（{shot.label}）</h3>
          <div className="rs-field">
            <textarea
              rows={6}
              value={
                shot[mode === "image" ? "imagePrompt" : "videoPrompt"] ||
                buildPromptPreview(project, shot, shotBound, mode)
              }
              onChange={(event) =>
                void onChange((p) => ({
                  ...p,
                  shots: p.shots.map((s) =>
                    s.id === shot.id
                      ? { ...s, [mode === "image" ? "imagePrompt" : "videoPrompt"]: event.target.value }
                      : s,
                  ),
                }))
              }
              placeholder={mode === "image" ? "描述替换效果，参考图自动组装" : "描述视频替换效果"}
            />
          </div>
          {mode === "image" && (
            <p className="rs-muted" style={{ fontSize: 11 }}>
              参考图顺序：图1 原图 · 图2 字母定位图 · 图3+ 目标形象{project.settings.withSceneRef && project.scenes[0]?.imagePath ? " · 场景参考" : ""}
            </p>
          )}
        </section>
        <section className="rs-panel">
          <h3>模型与参数</h3>
          <div className="rs-field">
            <span>中转站</span>
            <select
              value={project.settings.providerId}
              onChange={(event) =>
                void onChange((p) => ({
                  ...p,
                  settings: { ...p.settings, providerId: event.target.value, imageModel: "", videoModel: "" },
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
            <span>{mode === "image" ? "图片模型" : "视频模型"}</span>
            <select
              value={mode === "image" ? project.settings.imageModel : project.settings.videoModel}
              onChange={(event) =>
                void onChange((p) => ({
                  ...p,
                  settings: { ...p.settings, [mode === "image" ? "imageModel" : "videoModel"]: event.target.value },
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
            <span>或手动填写模型 ID</span>
            <input
              value={mode === "image" ? project.settings.imageModel : project.settings.videoModel}
              placeholder={mode === "image" ? "例如 gpt-image-1 / seedream-4.0" : "例如 seedance-1.0 / kling-v2"}
              onChange={(event) =>
                void onChange((p) => ({
                  ...p,
                  settings: { ...p.settings, [mode === "image" ? "imageModel" : "videoModel"]: event.target.value },
                }))
              }
            />
          </div>
          {mode === "image" ? (
            <div className="rs-row">
              <div className="rs-field" style={{ flex: "1 1 140px" }}>
                <span>尺寸</span>
                <select
                  value={project.settings.imageSize}
                  onChange={(event) =>
                    void onChange((p) => ({ ...p, settings: { ...p.settings, imageSize: event.target.value } }))
                  }
                >
                  {IMAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size === "auto" ? "自动" : size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rs-field" style={{ flex: "1 1 120px" }}>
                <span>质量</span>
                <select
                  value={project.settings.imageQuality}
                  onChange={(event) =>
                    void onChange((p) => ({ ...p, settings: { ...p.settings, imageQuality: event.target.value } }))
                  }
                >
                  {IMAGE_QUALITIES.map((quality) => (
                    <option key={quality} value={quality}>
                      {quality}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="rs-row">
              <div className="rs-field" style={{ flex: "1 1 120px" }}>
                <span>时长（秒）</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={project.settings.videoDuration}
                  onChange={(event) =>
                    void onChange((p) => ({
                      ...p,
                      settings: { ...p.settings, videoDuration: Math.max(1, Math.min(30, Number(event.target.value) || 5)) },
                    }))
                  }
                />
              </div>
              <div className="rs-field" style={{ flex: "1 1 140px" }}>
                <span>比例</span>
                <select
                  value={project.settings.videoRatio}
                  onChange={(event) =>
                    void onChange((p) => ({ ...p, settings: { ...p.settings, videoRatio: event.target.value } }))
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
          )}
          {mode === "image" && (
            <label className="rs-field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={project.settings.withSceneRef}
                onChange={(event) =>
                  void onChange((p) => ({ ...p, settings: { ...p.settings, withSceneRef: event.target.checked } }))
                }
              />
              附带场景参考图
            </label>
          )}
        </section>
      </GenerationPanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 视频舞台(替换首帧 / 人物参考图输入模式 + 结果/源预览)
// ---------------------------------------------------------------------------
function VideoStage({
  shot,
  project,
  inputMode,
  setInputMode,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  shot: RsShot;
  project: RsProject;
  inputMode: "first-frame" | "character-ref";
  setInputMode: (mode: "first-frame" | "character-ref") => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const [cutting, setCutting] = useState(false);
  const [cutMessage, setCutMessage] = useState("");
  const activeImage = shot.imageResults[shot.imageActiveIndex] ?? null;
  const appearance = useMemo(() => {
    if (inputMode !== "character-ref") return null;
    const cluster = project.sourceCharacters.find((c) => c.targetCharacterId && c.targetAppearanceId);
    if (!cluster) return null;
    const character = project.characters.find((c) => c.id === cluster.targetCharacterId);
    return character?.appearances.find((a) => a.id === cluster.targetAppearanceId) ?? null;
  }, [inputMode, project.sourceCharacters, project.characters]);
  const source = project.sources.find((s) => s.id === shot.sourceId) ?? project.sources[0] ?? null;
  const sourcePath = source?.path ?? null;
  const path = inputMode === "first-frame" && activeImage ? activeImage.outputPath : (appearance?.imagePath ?? sourcePath ?? "");

  const trimCurrentClip = async () => {
    if (!source || source.kind !== "video") {
      setCutMessage("需要视频素材才能裁剪当前片段");
      return;
    }
    setCutting(true);
    setCutMessage("");
    try {
      const host = await ensureHostApi();
      const clip = await host.materializeShot({
        file: source.path,
        startSec: shot.startSec,
        durationSec: shot.durationSec,
        reverse: shot.reversed,
      });
      await host.showItem(clip.path);
      setCutMessage("当前片段已裁剪: " + clip.path.split(/[\\/]/).pop());
    } catch (reason) {
      setCutMessage(`裁剪失败: ${errorText(reason)}`);
    } finally {
      setCutting(false);
    }
  };

  return (
    <div className="rs-stage-shell">
      <div className="rs-stage-tools">
        <span className="rs-tag">{shot.label} · {inputMode === "first-frame" ? "替换首帧" : "人物参考图"}</span>
        <span style={{ flex: 1 }} />
        <button
          className={`rs-btn${inputMode === "first-frame" ? " primary" : ""}`}
          onClick={() => setInputMode("first-frame")}
        >
          替换首帧
        </button>
        <button
          className={`rs-btn${inputMode === "character-ref" ? " primary" : ""}`}
          onClick={() => setInputMode("character-ref")}
        >
          人物参考图
        </button>
        <button
          className="rs-btn ghost"
          disabled={cutting}
          onClick={() => void trimCurrentClip()}
          title="用 FFmpeg 切出当前镜头片段并在文件夹中显示"
        >
          {cutting ? "裁剪中…" : "裁剪当前片段"}
        </button>
        {canPrev && (
          <button className="rs-btn ghost" onClick={onPrev} title="上一镜头">
            ←
          </button>
        )}
        {canNext && (
          <button className="rs-btn ghost" onClick={onNext} title="下一镜头">
            →
          </button>
        )}
      </div>
      <div className="rs-stage">
        {path ? (
          <video src={toFileUrl(path)} controls className="rs-stage-video" />
        ) : (
          <div className="rs-stage-empty">
            {inputMode === "first-frame" ? "请先在图像替换中生成替换图" : "请先绑定人物并在素材设定添加形象图"}
          </div>
        )}
      </div>
      {cutMessage && (
        <p className="rs-muted" style={{ padding: "6px 10px", fontSize: 11 }}>
          {cutMessage}
        </p>
      )}
    </div>
  );
}

function toFileUrl(p: string): string {
  return "file:///" + p.replace(/\\/g, "/");
}

// ---------------------------------------------------------------------------
// 生成实现
// ---------------------------------------------------------------------------
type ShotBoundItem = {
  person: {
    letter: string;
    label: string;
    bbox: { x: number; y: number; w: number; h: number };
    orientation?: RsOrientation;
  };
  cluster: { scope: RsBindingLine["scope"] };
  character: { name: string } | null;
  appearance: { name: string; prompt: string; imagePath: string | null } | null;
};

async function generateImageForShot(
  host: Awaited<ReturnType<typeof ensureHostApi>>,
  project: RsProject,
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>,
  shot: RsShot,
  bound: ShotBoundItem[],
) {
  if (!shot.keyframePath) throw new Error("镜头缺少关键帧");
  if (!project.settings.imageModel.trim()) throw new Error("请选择/填写图片生成模型");
  const keyFrameData = await host.readImage(shot.keyframePath).catch(() => null);
  if (!keyFrameData) throw new Error("无法读取关键帧，请检查文件是否存在");

  const boxes = guideBoxesForCharacters(
    shot.people.map((person, index) => ({
      id: person.id,
      label: person.label || `人物${letterAt(index)}`,
      bbox: person.bbox,
      targetCharacterId: person.sourceCharacterId ?? null,
    })),
  );
  const guideDataUrl = boxes.length
    ? await renderGuideBoxes(keyFrameData, boxes, shot.people.map((p) => p.description))
    : keyFrameData;
  const saved = await host.saveDataImage({ dataUrl: guideDataUrl, name: "guide" });

  const appearancePaths: string[] = [];
  const bindings: RsBindingLine[] = bound.map((item, index) => {
    const path = item.appearance?.imagePath ?? null;
    let imageIndex: number | null = null;
    if (path) {
      const existing = appearancePaths.indexOf(path);
      imageIndex = existing >= 0 ? existing + 3 : appearancePaths.length + 3;
      if (existing < 0) appearancePaths.push(path);
    }
    return {
      letter: item.person.letter,
      label: item.person.label,
      description: item.character?.name ?? "",
      orientation: item.person.orientation ?? "unknown",
      imageIndex,
      scope: item.cluster.scope,
      characterName: item.character?.name ?? "",
      appearanceName: item.appearance?.name || null,
      appearancePrompt: item.appearance?.prompt ?? "",
    };
  });

  const sceneRef = project.settings.withSceneRef && project.scenes[0]?.imagePath ? project.scenes[0] : null;
  let sceneImageIndex: number | null = null;
  if (sceneRef?.imagePath) {
    appearancePaths.push(sceneRef.imagePath);
    sceneImageIndex = appearancePaths.length + 2;
  }
  // 迭代参考:上一轮生成结果,作为最后一张参考图。
  let iterationRefLine: string | null = null;
  if (shot.referenceImagePath && !appearancePaths.includes(shot.referenceImagePath)) {
    appearancePaths.push(shot.referenceImagePath);
    iterationRefLine = iterationReferenceLine(appearancePaths.length + 2);
  }

  const prompt = buildRsImagePrompt({
    template: project.settings.imagePromptTemplate,
    shotLabel: shot.label,
    bindings,
    sceneRef: sceneRef ? { name: sceneRef.name, imageIndex: sceneImageIndex } : null,
    iterationRefLine,
  });

  const references: { kind: "image"; path: string }[] = [
    { kind: "image", path: shot.keyframePath },
    { kind: "image", path: saved.path },
    ...appearancePaths.map((path) => ({ kind: "image" as const, path })),
  ];

  await onChange((p) => ({
    ...p,
    shots: p.shots.map((s) =>
      s.id === shot.id ? { ...s, imagePrompt: prompt, imageStatus: "generating" as const, imageError: null } : s,
    ),
  }));

  const result = await host.generateImage({
    providerId: project.settings.providerId,
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
  await onChange((p) => ({
    ...p,
    shots: p.shots.map((s) =>
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
      { id: item.id, kind: "image" as const, at: item.createdAt, prompt, model: item.model, outputPath: item.outputPath, shotId: shot.id },
      ...p.history,
    ].slice(0, 200),
  }));
}

async function generateVideoForShot(
  host: Awaited<ReturnType<typeof ensureHostApi>>,
  project: RsProject,
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>,
  shot: RsShot,
  bound: ShotBoundItem[],
  inputMode: "first-frame" | "character-ref",
) {
  if (!project.settings.videoModel.trim()) throw new Error("请选择/填写视频生成模型");
  const sourcePath = project.sources[0]?.path ?? null;
  const activeImage = shot.imageResults[shot.imageActiveIndex] ?? null;
  let imagePath: string | null = null;
  if (inputMode === "first-frame") {
    imagePath = activeImage?.outputPath ?? null;
  } else {
    const cluster = project.sourceCharacters.find((c) => c.targetCharacterId && c.targetAppearanceId);
    const appearance = cluster
      ? project.characters.find((c) => c.id === cluster.targetCharacterId)?.appearances.find((a) => a.id === cluster.targetAppearanceId)
      : null;
    imagePath = appearance?.imagePath ?? null;
  }
  if (!imagePath) {
    throw new Error(inputMode === "first-frame" ? "请先生成并选中替换图" : "请先绑定人物并准备形象参考图");
  }

  const bindings: RsBindingLine[] = bound.map((item, index) => ({
    letter: item.person.letter,
    label: item.person.label,
    description: "",
    imageIndex: null,
    scope: item.cluster.scope,
    characterName: item.character?.name ?? "",
    appearanceName: item.appearance?.name || null,
    appearancePrompt: item.appearance?.prompt ?? "",
  }));
  const prompt = buildRsVideoPrompt({
    template: project.settings.videoPromptTemplate,
    shotLabel: shot.label,
    bindings,
  });
  const references: { kind: "image" | "video"; path: string }[] = [{ kind: "image", path: imagePath }];
  if (sourcePath) references.push({ kind: "video", path: sourcePath });

  await onChange((p) => ({
    ...p,
    shots: p.shots.map((s) =>
      s.id === shot.id ? { ...s, videoPrompt: prompt, videoStatus: "generating" as const, videoError: null } : s,
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
  await onChange((p) => ({
    ...p,
    shots: p.shots.map((s) =>
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
      { id: item.id, kind: "video" as const, at: item.createdAt, prompt, model: item.model, outputPath: item.outputPath, shotId: shot.id },
      ...p.history,
    ].slice(0, 200),
  }));
}

function buildPromptPreview(
  project: RsProject,
  shot: RsShot,
  bound: ShotBoundItem[],
  mode: "image" | "video",
): string {
  if (mode === "image") {
    return buildRsImagePrompt({
      template: project.settings.imagePromptTemplate,
      shotLabel: shot.label,
      bindings: bound.map((b, index) => ({
        letter: b.person.letter,
        label: b.person.label,
        description: b.character?.name ?? "",
        imageIndex: b.appearance?.imagePath ? index + 3 : null,
        scope: b.cluster.scope,
        characterName: b.character?.name ?? "",
        appearanceName: b.appearance?.name || null,
        appearancePrompt: b.appearance?.prompt ?? "",
      })),
    });
  }
  return buildRsVideoPrompt({ template: project.settings.videoPromptTemplate, shotLabel: shot.label, bindings: [] });
}

function renderGuideBoxes(
  imageDataUrl: string,
  boxes: { letter: string; bbox: { x: number; y: number; w: number; h: number } }[],
  descriptions: string[],
): Promise<string> {
  return renderGuideImage({
    imageDataUrl,
    boxes: boxes.map((box, index) => ({
      letter: box.letter,
      bbox: box.bbox,
      name: descriptions[index] ? `·${descriptions[index]!.slice(0, 8)}` : null,
    })),
  });
}

function RS_LETTER_IDX(hint: string | null, index: number): number {
  if (hint) {
    const m = /人物([A-H])|^([A-H])$/i.exec(hint.trim());
    if (m) return (m[1] || m[2] || "A").toUpperCase().charCodeAt(0) - 65;
  }
  return index;
}
