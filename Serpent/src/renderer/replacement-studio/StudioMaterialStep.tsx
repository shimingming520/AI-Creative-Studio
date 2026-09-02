/**
 * 步骤 1 · 素材设定 v2:导入素材 → 智能裁剪(FFmpeg 场景检测)切分镜头 →
 * 逐镜头关键帧检测人物(视觉大模型) → 跨镜头聚类身份 → 目标角色绑定。
 * 布局:左=素材库(人物/场景/音频/总素材) 中=源素材+分析 右=检测/身份绑定。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clusterPeople,
  letterAt,
  labelForLetter,
  parseDetectedPeople,
  rsId,
  RS_SMART_CLIP_MODES,
  RS_SMART_CLIP_THRESHOLDS,
  type RsAudioAsset,
  type RsPerson,
  type RsProject,
  type RsScene,
  type RsShot,
  type RsSmartClipMode,
  type RsSource,
  type RsSourceCharacter,
  type RsTargetCharacter,
} from "../../shared/replacement-studio";
import { ensureHostApi, errorText, type RsProviderInfo } from "./host";
import { BindingList, ShotTimeline, TargetRail, formatPrecise, type RsAssetTab } from "./StudioParts";

const ALLOWED_VIDEO_EXT = /\.(mp4|mov|mkv|webm|avi)$/i;

export function StudioMaterialStep({
  project,
  onChange,
}: {
  project: RsProject;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [providers, setProviders] = useState<RsProviderInfo[]>([]);
  const [tab, setTab] = useState<RsAssetTab>("character");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [selectedShotPreview, setSelectedShotPreview] = useState<string | null>(null);

  const source = project.sources[0] ?? null;
  const [focusedShotId, setFocusedShotId] = useState<string | null>(null);
  const selectedShot =
    project.shots.find((s) => s.id === focusedShotId) ?? project.shots[0] ?? null;

  useEffect(() => {
    void ensureHostApi()
      .then((host) => host.listProviders())
      .then((list) => setProviders((list || []).filter((p) => p.enabled && p.hasApiKey)))
      .catch(() => void 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const path = selectedShot?.keyframePath;
    if (!path) {
      setSelectedShotPreview(null);
      return;
    }
    void ensureHostApi()
      .then((host) => host.readImage(path))
      .then((url) => {
        if (!cancelled) setSelectedShotPreview(url);
      })
      .catch(() => {
        if (!cancelled) setSelectedShotPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedShot?.keyframePath]);

  const appendLog = useCallback((line: string) => {
    setLog((cur) => [...cur.slice(-40), line]);
  }, []);

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

  // -------- 素材导入 --------
  const pickSource = (kind: "video" | "image") =>
    run(`选择${kind === "video" ? "视频" : "图片"}`, async () => {
      const host = await ensureHostApi();
      const picked = kind === "video" ? await host.pickVideo() : await host.pickImages(false);
      const file = picked?.[0];
      if (!file) return;
      const probe = await host.probe({ file: file.path });
      const newSource: RsSource = {
        id: rsId("src"),
        path: file.path,
        name: file.name,
        kind: probe.isVideo ? "video" : kind,
        durationSec: probe.durationSec,
        width: probe.width,
        height: probe.height,
        keyframePath: null,
        analysisStatus: "idle",
        analysisError: null,
      };
      await onChange((p) => ({
        ...p,
        sources: [newSource],
        shots: [],
        sourceCharacters: [],
        compose: { ...p.compose, finalVideoPath: null, finalAudioPath: null, status: "idle", error: null, composedShotIds: [] },
      }));
      if (!probe.isVideo) {
        await onChange((p) => ({
          ...p,
          sources: p.sources.map((s) => (s.id === newSource.id ? { ...s, keyframePath: file.path, analysisStatus: "done" as const } : s)),
          shots: [makeShotForImage(file.path)],
        }));
        appendLog(`已导入图片素材: ${file.name}`);
      } else {
        appendLog(`已导入视频素材: ${file.name}（${probe.durationSec?.toFixed(1)}s）`);
      }
    });

  // -------- 智能裁剪 + 逐镜头关键帧 + 检测 + 聚类 --------
  const analyze = () =>
    run("分析素材", async () => {
      if (!source) throw new Error("请先导入视频或图片");
      const host = await ensureHostApi();
      appendLog("1/4 开始智能裁剪（FFmpeg 场景检测）…");
      if (source.kind === "image") {
        await onChange((p) => ({
          ...p,
          sources: p.sources.map((s) => (s.id === source.id ? { ...s, keyframePath: source.path, analysisStatus: "done" as const } : s)),
          shots: [makeShotForImage(source.path)],
        }));
        appendLog("图片素材: 使用整图作为单一镜头");
        return;
      }
      const clip = await host.smartClip({
        file: source.path,
        threshold: RS_SMART_CLIP_THRESHOLDS[project.settings.smartClipMode],
      });
      const shotMeta = clip.shots.map((s, index) =>
        makeShotFromMeta(s, source.id, index + 1),
      );
      await onChange((p) => ({
        ...p,
        sources: p.sources.map((s) => (s.id === source.id ? { ...s, analysisStatus: "running" as const } : s)),
        shots: shotMeta,
      }));
      appendLog(`智能裁剪完成: ${shotMeta.length} 个镜头`);

      appendLog("2/4 逐镜头抽取关键帧…");
      const keyframes: Record<string, string> = {};
      let shotIndex = 0;
      for (const shot of shotMeta) {
        shotIndex += 1;
        const frame = await host.extractFrameAt({ file: source.path, timeSec: shot.keyframeTimeSec });
        keyframes[shot.id] = frame.path;
        await onChange((p) => ({
          ...p,
          shots: p.shots.map((s) => (s.id === shot.id ? { ...s, keyframePath: frame.path } : s)),
        }));
        appendLog(`  镜头 ${shotIndex}/${shotMeta.length} 关键帧完成`);
      }

      const detectPrompt = project.settings.detectPrompt.trim() || "列出图片中所有人物";
      if (!project.settings.detectProviderId || !project.settings.detectModel.trim()) {
        appendLog("3/4 跳过人物检测（请先配置检测中转站与模型）");
        await finishAnalysis();
        return;
      }
      appendLog(`3/4 逐镜头检测人物（${project.settings.detectModel}）…`);
      const clusterInput = [];
      for (const shot of shotMeta) {
        const keyframePath = keyframes[shot.id];
        if (!keyframePath) continue;
        try {
          const result = await host.detectPeople({
            providerId: project.settings.detectProviderId,
            model: project.settings.detectModel.trim(),
            prompt: detectPrompt,
            imagePath: keyframePath,
          });
          const detected = parseDetectedPeople(result?.text || "");
          const people: RsPerson[] = detected.map((d, index) => ({
            id: rsId("ps"),
            letter: letterAt(RS_LETTER_IDX(d.labelHint, index)),
            label: labelForLetter(letterAt(RS_LETTER_IDX(d.labelHint, index))),
            bbox: d.bbox,
            description: d.description,
            confidence: d.confidence,
            method: "auto",
            orientation: "unknown",
            sourceCharacterId: null,
          }));
          for (const person of people) {
            clusterInput.push({
              shotId: shot.id,
              personId: person.id,
              letter: person.letter,
              description: person.description,
              bbox: person.bbox,
            });
          }
          await onChange((p) => ({
            ...p,
            shots: p.shots.map((s) =>
              s.id === shot.id ? { ...s, people, detectionStatus: "done" as const, detectionError: null } : s,
            ),
          }));
          appendLog(`  镜头 ${shot.label}: ${people.length} 人`);
        } catch (reason) {
          await onChange((p) => ({
            ...p,
            shots: p.shots.map((s) =>
              s.id === shot.id ? { ...s, detectionStatus: "error" as const, detectionError: errorText(reason) } : s,
            ),
          }));
          appendLog(`  镜头 ${shot.label} 检测失败: ${errorText(reason)}`);
        }
      }

      appendLog("4/4 跨镜头身份聚类…");
      const clusters: RsSourceCharacter[] = clusterPeople(clusterInput).map((c) => ({
        id: c.sourceCharacterId,
        letter: c.letter,
        label: c.label,
        personIds: c.personIds,
        description: c.description,
        scope: "full-person",
        targetCharacterId: null,
        targetAppearanceId: null,
      }));
      await applyClusters(clusters);
      await finishAnalysis();
      appendLog(`分析完成: ${shotMeta.length} 个镜头, ${clusters.length} 个身份, 请在右侧绑定目标角色`);
    });

  const applyClusters = async (clusters: RsSourceCharacter[]) =>
    onChange((p) => ({
      ...p,
      sourceCharacters: clusters.map((c) => ({
        ...c,
        scope: "full-person" as const,
        targetCharacterId: null,
        targetAppearanceId: null,
      })),
      shots: p.shots.map((s) => ({
        ...s,
        people: s.people.map((person) => {
          const cluster = clusters.find((c) => c.personIds.includes(person.id));
          return cluster ? { ...person, sourceCharacterId: cluster.id } : person;
        }),
      })),
    }));

  const finishAnalysis = async () =>
    onChange((p) => ({
      ...p,
      sources: p.sources.map((s) => (s.id === source?.id ? { ...s, analysisStatus: "done" as const } : s)),
    }));

  // -------- 素材库管理 --------
  const addCharacter = () =>
    run("新建角色", async () => {
      const character: RsTargetCharacter = {
        id: rsId("char"),
        name: `角色${project.characters.length + 1}`,
        role: "",
        description: "",
        appearances: [],
        boundLetters: [],
      };
      await onChange((p) => ({ ...p, characters: [...p.characters, character] }));
    });
  const addAppearance = (characterId: string) =>
    run("添加形象", async () => {
      const host = await ensureHostApi();
      const picked = await host.pickImages(true);
      if (!picked?.length) return;
      const appearances = picked.map((f) => ({
        id: rsId("appa"),
        name: f.name.replace(/\.[^.]+$/, ""),
        imagePath: f.path,
        prompt: "",
      }));
      await onChange((p) => ({
        ...p,
        characters: p.characters.map((c) => (c.id === characterId ? { ...c, appearances: [...c.appearances, ...appearances] } : c)),
      }));
    });
  const addScene = () =>
    run("新建场景", async () => {
      const host = await ensureHostApi();
      const picked = await host.pickImages(false);
      if (!picked?.[0]) return;
      const scene: RsScene = { id: rsId("scene"), name: picked[0].name.replace(/\.[^.]+$/, ""), description: "", imagePath: picked[0].path };
      await onChange((p) => ({ ...p, scenes: [...p.scenes, scene] }));
    });
  const addAudio = () =>
    run("添加音频", async () => {
      const host = await ensureHostApi();
      const picked = await host.pickFiles();
      const files = (picked || []).filter((f) => /\.(mp3|wav|m4a|flac|ogg)$/i.test(f.path));
      if (files.length === 0) return;
      const audios: RsAudioAsset[] = files.map((f) => ({
        id: rsId("aud"),
        name: f.name,
        path: f.path,
        durationSec: null,
        targetCharacterId: null,
      }));
      await onChange((p) => ({ ...p, audios: [...p.audios, ...audios] }));
    });
  const removeCard = (key: string) => {
    const [kind, id] = key.split(":");
    void onChange((p) => {
      if (kind === "character") {
        return {
          ...p,
          characters: p.characters.filter((c) => c.id !== id),
          sourceCharacters: p.sourceCharacters.map((c) =>
            c.targetCharacterId === id ? { ...c, targetCharacterId: null, targetAppearanceId: null } : c,
          ),
        };
      }
      if (kind === "scene") return { ...p, scenes: p.scenes.filter((s) => s.id !== id) };
      if (kind === "audio") return { ...p, audios: p.audios.filter((a) => a.id !== id) };
      return p;
    });
  };

  const boundCount = project.sourceCharacters.filter((c) => c.targetCharacterId && c.targetAppearanceId).length;
  const detectedShots = project.shots.filter((s) => s.detectionStatus === "done").length;

  return (
    <div className="rs-four-panel material">
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
        <section className="rs-panel">
          <h3>
            源素材
            <span className="hint">智能裁剪:按场景变化自动切分镜头（检测 N 人的话需先在下方配置检测）</span>
          </h3>
          {source ? (
            <div className="rs-col">
              <div className="rs-media-card">
                <div className="meta">
                  <code>{source.name}</code>
                  <span style={{ flex: 1 }} />
                  <span className="rs-tag">{source.width}×{source.height}</span>
                  {source.durationSec !== null && <span className="rs-tag">{source.durationSec.toFixed(1)}s</span>}
                </div>
              </div>
              <div className="rs-row" style={{ alignItems: "center", gap: 10 }}>
                <button className="rs-btn ghost" disabled={busy} onClick={() => void pickSource("video")}>
                  更换视频
                </button>
                <button className="rs-btn ghost" disabled={busy} onClick={() => void pickSource("image")}>
                  换图片
                </button>
              </div>
            </div>
          ) : (
            <div className="rs-empty">
              <p style={{ marginBottom: 10 }}>导入一条视频（自动智能裁剪）或一张图片作为替换素材。</p>
              <div className="rs-row" style={{ justifyContent: "center" }}>
                <button className="rs-btn primary" disabled={busy} onClick={() => void pickSource("video")}>
                  选择视频…
                </button>
                <button className="rs-btn" disabled={busy} onClick={() => void pickSource("image")}>
                  选择图片…
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rs-panel">
          <h3>
            智能裁剪设置
            <span className="hint">镜头很碎时会自动合并过短片段</span>
          </h3>
          <div className="rs-row">
            {RS_SMART_CLIP_MODES.map((mode) => (
              <button
                key={mode.id}
                className={`rs-btn${project.settings.smartClipMode === mode.id ? " primary" : ""}`}
                title={mode.hint}
                disabled={busy}
                onClick={() =>
                  void onChange((p) => ({ ...p, settings: { ...p.settings, smartClipMode: mode.id } }))
                }
              >
                {mode.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rs-panel">
          <h3>检测设置</h3>
          <div className="rs-row">
            <div className="rs-field" style={{ flex: "1 1 200px" }}>
              <span>检测中转站</span>
              <select
                value={project.settings.detectProviderId}
                onChange={(event) =>
                  void onChange((p) => ({ ...p, settings: { ...p.settings, detectProviderId: event.target.value } }))
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
            <div className="rs-field" style={{ flex: "1 1 200px" }}>
              <span>检测模型</span>
              <input
                value={project.settings.detectModel}
                placeholder="例如 qwen-vl-max / gpt-4.1-mini"
                onChange={(event) =>
                  void onChange((p) => ({ ...p, settings: { ...p.settings, detectModel: event.target.value } }))
                }
              />
            </div>
          </div>
        </section>

        <section className="rs-panel">
          <h3>
            分析
            <span className="hint">当前状态: {project.shots.length} 镜头 · {detectedShots} 已检测 · {boundCount} 已绑定</span>
          </h3>
          <div className="rs-row">
            <button className="rs-btn primary" disabled={busy || !source} onClick={() => void analyze()}>
              {busy ? <span className="rs-spinner" /> : null}
              {source?.analysisStatus === "running" ? "处理中…" : "开始处理（智能裁剪）"}
            </button>
            {log.length > 0 && (
              <div className="rs-log" style={{ flex: "1 1 100%" }}>
                {log.map((line, index) => (
                  <div key={index} className="rs-muted" style={{ fontSize: 11 }}>
                    {line}
                  </div>
                ))}
              </div>
            )}
            {message && (
              <div className="rs-banner error" style={{ flex: "1 1 100%" }}>
                {message}
              </div>
            )}
          </div>
        </section>

        {project.shots.length > 0 && (
          <ShotTimeline
            shots={project.shots}
            selectedShotId={selectedShot?.id ?? null}
            onSelectShot={(shotId) => setFocusedShotId(shotId)}
            onDetectAll={() => void analyze()}
            onDeleteShots={(ids) =>
              void onChange((p) => ({
                ...p,
                shots: p.shots.filter((s) => !ids.includes(s.id)),
              }))
            }
            busy={busy}
            detectBusy={busy}
          />
        )}
      </div>

      <aside className="rs-detail">
        <section className="rs-panel">
          <h3>
            镜头预览
            <span className="hint">{selectedShot ? selectedShot.label : "未分析"}</span>
          </h3>
          {selectedShotPreview ? (
            <img src={selectedShotPreview} alt="镜头" style={{ width: "100%", borderRadius: 8 }} />
          ) : (
            <div className="rs-empty">完成分析后显示镜头关键帧</div>
          )}
          {selectedShot && (
            <div className="rs-row" style={{ marginTop: 8 }}>
              <span className="rs-tag">{formatPrecise(selectedShot.startSec)} → {formatPrecise(selectedShot.endSec)}</span>
              <span className="rs-tag">{selectedShot.people.length} 人</span>
            </div>
          )}
        </section>
        <section className="rs-panel">
          <h3>
            身份绑定
            <span className="hint">跨镜头聚类成功后在此绑定目标角色</span>
          </h3>
          <BindingList project={project} onChange={onChange} compact />
        </section>
      </aside>
    </div>
  );
}

function makeShotFromMeta(
  meta: { startSec: number; endSec: number; durationSec: number; keyframeTimeSec: number },
  sourceId: string,
  index: number,
): RsShot {
  return {
    id: rsId("shot"),
    index,
    label: `镜头${index}`,
    sourceId,
    startSec: meta.startSec,
    endSec: meta.endSec,
    durationSec: meta.durationSec,
    videoPath: null,
    keyframePath: null,
    keyframeTimeSec: meta.keyframeTimeSec,
    people: [],
    detectionStatus: "idle",
    detectionError: null,
    imagePrompt: "",
    imageResults: [],
    imageActiveIndex: 0,
    imageStatus: "idle",
    imageError: null,
    referenceImagePath: null,
    videoPrompt: "",
    videoResults: [],
    videoActiveIndex: 0,
    videoStatus: "idle",
    videoError: null,
    reversed: false,
    voiceText: "",
    voiceAudioPath: null,
    voiceStatus: "idle",
    voiceError: null,
    selected: true,
  };
}

function makeShotForImage(path: string): RsShot {
  return {
    ...makeShotFromMeta({ startSec: 0, endSec: 1, durationSec: 1, keyframeTimeSec: 0 }, "", 1),
    keyframePath: path,
    detectionStatus: "idle",
  };
}

function RS_LETTER_IDX(hint: string | null, index: number): number {
  if (hint) {
    const m = /人物([A-H])|^([A-H])$/i.exec(hint.trim());
    if (m) return (m[1] || m[2] || "A").toUpperCase().charCodeAt(0) - 65;
  }
  return index;
}
