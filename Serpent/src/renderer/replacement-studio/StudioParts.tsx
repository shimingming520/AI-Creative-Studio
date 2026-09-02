/**
 * 替换工作室 v2 — 共享部件:检测舞台 / 镜头时间线 / 目标素材栏 / 生成面板骨架。
 * 结构对齐 ShuoCanvas personReplacement(四栏布局 + HTML overlay 人物框 + 镜头卡片网格)。
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  RsBbox,
  RsGeneratedItem,
  RsOrientation,
  RsPerson,
  RsProject,
  RsScene,
  RsShot,
  RsSourceCharacter,
  RsTargetCharacter,
} from "../../shared/replacement-studio";
import { RS_ORIENTATION_LABELS, RS_SCOPE_LABELS } from "../../shared/replacement-studio";
import { ensureHostApi, errorText } from "./host";
import { guideColor } from "./guide-image";

export function formatClock(sec: number): string {
  const total = Math.max(0, Math.floor(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatPrecise(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}${(sec % 1).toFixed(2).slice(1)}`;
}

// ---------------------------------------------------------------------------
// 检测舞台(关键帧 + 人物框 overlay + 字母/描述标签 + 前后镜头箭头)
// 交互:手动框选绘制 / 选中框拖动与 8 向缩放 / 朝向 picker / 拖拽绑定 / 删除。
// ---------------------------------------------------------------------------
export type RsPersonPatch = {
  bbox?: { x: number; y: number; w: number; h: number };
  orientation?: RsOrientation;
  sourceCharacterId?: string | null;
};

const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
type Handle = (typeof HANDLES)[number];

export const RS_CHARACTER_DRAG_TYPE = "application/x-rs-character";
export const RS_CHARACTER_DRAG_PAYLOAD = { characterId: "", appearanceId: null as string | null };

export function StageCanvas({
  shot,
  imageData,
  clusters,
  characters,
  selectedPersonId,
  onSelectPerson,
  onPersonChanged,
  onAddManualPerson,
  onRemovePerson,
  onBindPersonByDrag,
  onPrev,
  onNext,
  canPrev,
  canNext,
  children,
}: {
  shot: RsShot | null;
  imageData: string | null;
  clusters: RsSourceCharacter[];
  characters: RsTargetCharacter[];
  selectedPersonId: string | null;
  onSelectPerson: (personId: string | null) => void;
  onPersonChanged: (personId: string, patch: RsPersonPatch) => void;
  onAddManualPerson: (bbox: RsBbox) => void;
  onRemovePerson: (personId: string) => void;
  onBindPersonByDrag: (personId: string, characterId: string, appearanceId: string | null) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  children?: ReactNode;
}) {
  const [drawing, setDrawing] = useState(false);
  const [draft, setDraft] = useState<RsBbox | null>(null);
  const [draggingDraw, setDraggingDraw] = useState(false);
  const [edit, setEdit] = useState<{
    id: string;
    mode: "move" | Handle;
    start: { x: number; y: number };
    origin: RsBbox;
  } | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const toNorm = (event: { clientX: number; clientY: number }) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
    };
  };

  const clampBox = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const onStagePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drawing) return;
    const p = toNorm(event);
    if (!p) return;
    dragStart.current = p;
    setDraggingDraw(true);
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onStagePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (edit) {
      const p = toNorm(event);
      if (!p) return;
      const dx = p.x - edit.start.x;
      const dy = p.y - edit.start.y;
      let next: RsBbox;
      if (edit.mode === "move") {
        next = {
          x: clampBox(edit.origin.x + dx, 0, 1 - edit.origin.w),
          y: clampBox(edit.origin.y + dy, 0, 1 - edit.origin.h),
          w: edit.origin.w,
          h: edit.origin.h,
        };
      } else {
        const { origin, mode } = edit;
        let x = origin.x;
        let y = origin.y;
        let w = origin.w;
        let h = origin.h;
        if (mode.includes("w")) {
          x = clampBox(origin.x + dx, 0, origin.x + origin.w - 0.02);
          w = origin.x + origin.w - x;
        }
        if (mode.includes("e")) w = clampBox(origin.w + dx, 0.02, 1 - origin.x);
        if (mode.includes("n")) {
          y = clampBox(origin.y + dy, 0, origin.y + origin.h - 0.02);
          h = origin.y + origin.h - y;
        }
        if (mode.includes("s")) h = clampBox(origin.h + dy, 0.02, 1 - origin.y);
        next = { x, y, w, h };
      }
      onPersonChanged(edit.id, { bbox: next });
      return;
    }
    if (dragStart.current && draft) {
      const p = toNorm(event);
      if (!p) return;
      const x0 = Math.min(dragStart.current.x, p.x);
      const y0 = Math.min(dragStart.current.y, p.y);
      setDraft({
        x: x0,
        y: y0,
        w: Math.min(1 - x0, Math.abs(p.x - dragStart.current.x)),
        h: Math.min(1 - y0, Math.abs(p.y - dragStart.current.y)),
      });
    }
  };
  const onStagePointerUp = () => {
    if (edit) {
      setEdit(null);
      return;
    }
    if (draggingDraw && draft && draft.w > 0.015 && draft.h > 0.015) {
      onAddManualPerson({ ...draft });
    }
    setDraggingDraw(false);
    dragStart.current = null;
    setDraft(null);
    setDrawing(false);
  };

  const startEdit = (
    event: React.PointerEvent<HTMLElement>,
    personId: string,
    mode: "move" | Handle,
    origin: RsBbox,
  ) => {
    event.stopPropagation();
    const p = toNorm(event);
    if (!p) return;
    setEdit({ id: personId, mode, start: p, origin });
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectPerson(personId);
  };

  if (!shot) {
    return <div className="rs-stage-empty">请选择一个镜头</div>;
  }

  return (
    <div className="rs-stage-shell" data-story-marquee-surface="people">
      <div className="rs-stage-tools">
        <span className="rs-tag">
          {shot.label} · {formatPrecise(shot.startSec)} → {formatPrecise(shot.endSec)}（{shot.durationSec.toFixed(1)}s）
        </span>
        <span style={{ flex: 1 }} />
        <button
          className={`rs-btn${drawing ? " primary" : ""}`}
          onClick={() => setDrawing((v) => !v)}
          title="在舞台上拖动绘制人物框"
        >
          {drawing ? "拖动画框中…" : "手动框选"}
        </button>
        {canPrev && (
          <button className="rs-btn ghost" onClick={onPrev} title="上一镜头">
            ← 上一镜头
          </button>
        )}
        {canNext && (
          <button className="rs-btn ghost" onClick={onNext} title="下一镜头">
            下一镜头 →
          </button>
        )}
      </div>
      <div
        ref={stageRef}
        className="rs-stage"
        style={{ cursor: drawing ? "crosshair" : "default" }}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={onStagePointerUp}
      >
        {imageData ? (
          <img src={imageData} alt={shot.label} draggable={false} className="rs-stage-image" />
        ) : (
          <div className="rs-stage-empty">视频仍在抽帧或没有可用关键帧</div>
        )}
        {imageData && (
          <div className="rs-boxes">
            {shot.people.map((person, index) => {
              const cluster = clusters.find((c) => c.id === person.sourceCharacterId);
              const bound = Boolean(cluster?.targetCharacterId && cluster.targetAppearanceId);
              const selected = person.id === selectedPersonId;
              return (
                <div
                  key={person.id}
                  className={`rs-box v2${bound ? " is-mapped" : " is-unready"}${selected ? " selected" : ""}`}
                  style={
                    {
                      left: `${person.bbox.x * 100}%`,
                      top: `${person.bbox.y * 100}%`,
                      width: `${person.bbox.w * 100}%`,
                      height: `${person.bbox.h * 100}%`,
                      "--box-color": guideColor(index),
                    } as React.CSSProperties
                  }
                  onPointerDown={(event) => startEdit(event, person.id, "move", person.bbox)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "copy";
                  }}
                  onDrop={(event) => {
                    const raw = event.dataTransfer.getData(RS_CHARACTER_DRAG_TYPE);
                    if (!raw) return;
                    event.preventDefault();
                    event.stopPropagation();
                    try {
                      const payload = JSON.parse(raw) as {
                        characterId: string;
                        appearanceId: string | null;
                      };
                      onBindPersonByDrag(person.id, payload.characterId, payload.appearanceId);
                    } catch {}
                  }}
                  title={`${person.label}${person.description ? ` · ${person.description}` : ""}`}
                >
                  <span className="letter">
                    {person.letter} · {person.label}
                  </span>
                  {person.description && <span className="desc">{person.description}</span>}
                  <span className="mapping">
                    {bound
                      ? `→ ${characters.find((c) => c.id === cluster!.targetCharacterId)?.name ?? ""}`
                      : "未绑定（拖入目标形象）"}
                  </span>
                  {selected && (
                    <>
                      <span className="rs-box-edit">
                        <select
                          value={person.orientation}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) =>
                            onPersonChanged(person.id, {
                              orientation: event.target.value as RsOrientation,
                            })
                          }
                        >
                          {(Object.keys(RS_ORIENTATION_LABELS) as RsOrientation[]).map((o) => (
                            <option key={o} value={o}>
                              朝向:{RS_ORIENTATION_LABELS[o]}
                            </option>
                          ))}
                        </select>
                        <button
                          className="rs-btn ghost danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            onRemovePerson(person.id);
                          }}
                        >
                          删除框
                        </button>
                      </span>
                      {HANDLES.map((handle) => (
                        <span
                          key={handle}
                          className={`rs-box-handle ${handle}`}
                          onPointerDown={(event) => startEdit(event, person.id, handle, person.bbox)}
                        />
                      ))}
                    </>
                  )}
                </div>
              );
            })}
            {shot.people.length === 0 && (
              <div
                className="rs-stage-empty"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                当前帧未检测到人物（怪物、兽人等非人形体可能被模型漏检，可直接「手动框选」）
              </div>
            )}
            {draft && (
              <div
                className="rs-box v2 manual-draft"
                style={
                  {
                    left: `${draft.x * 100}%`,
                    top: `${draft.y * 100}%`,
                    width: `${draft.w * 100}%`,
                    height: `${draft.h * 100}%`,
                    "--box-color": "#ffd60a",
                  } as React.CSSProperties
                }
              />
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 镜头时间线(镜头卡片网格 + 全选/重新检测/删除 + 状态徽标)
// ---------------------------------------------------------------------------
export function ShotTimeline({
  shots,
  selectedShotId,
  onSelectShot,
  onDetectAll,
  onDeleteShots,
  busy,
  detectBusy,
  childrenExtra,
}: {
  shots: RsShot[];
  selectedShotId: string | null;
  onSelectShot: (shotId: string) => void;
  onDetectAll: () => void;
  onDeleteShots: (shotIds: string[]) => void;
  busy: boolean;
  detectBusy: boolean;
  childrenExtra?: ReactNode;
}) {
  const [multi, setMulti] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [previews, setPreviews] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const need = shots.filter(
      (s) => s.keyframePath && !(s.keyframePath in previews),
    );
    if (need.length === 0) return;
    let cancelled = false;
    void ensureHostApi()
      .then((host) =>
        Promise.all(
          need.map(async (s) => {
            const url = await host.readImage(s.keyframePath!).catch(() => null);
            return [s.id, url] as const;
          }),
        ),
      )
      .then((entries) => {
        if (cancelled) return;
        setPreviews((cur) => {
          const next = { ...cur };
          for (const [key, url] of entries) next[key] = url ?? null;
          return next;
        });
      })
      .catch(() => void 0);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shots]);

  const toggleMulti = () => {
    setMulti((v) => {
      if (v) setSelection(new Set());
      return !v;
    });
  };
  const toggleSelect = (shotId: string) => {
    setSelection((cur) => {
      const next = new Set(cur);
      if (next.has(shotId)) next.delete(shotId);
      else next.add(shotId);
      return next;
    });
  };

  return (
    <section className="rs-timeline" aria-label="镜头片段网格">
      <header className="rs-timeline-header">
        <strong>镜头片段</strong>
        <span className="rs-muted">
          {shots.length} 个片段 · 总长{" "}
          {formatClock(shots.reduce((sum, s) => sum + s.durationSec, 0))}
        </span>
        <span style={{ flex: 1 }} />
        <span className="rs-muted">点击片段切换预览</span>
        {multi ? (
          <>
            <button
              className="rs-btn"
              onClick={() => {
                const all = shots.map((s) => s.id);
                if (selection.size === shots.length) setSelection(new Set());
                else setSelection(new Set(all));
              }}
            >
              {selection.size === shots.length ? "取消全选" : "全选"}
            </button>
            <button className="rs-btn" disabled={selection.size === 0} onClick={() => { onDeleteShots([...selection]); setSelection(new Set()); setMulti(false); }}>
              删除所选（{selection.size}）
            </button>
            <button className="rs-btn ghost" onClick={toggleMulti}>取消</button>
          </>
        ) : (
          <>
            <button className="rs-btn" disabled={detectBusy || busy} onClick={() => void onDetectAll()}>
              {detectBusy ? <span className="rs-spinner" /> : null}
              {detectBusy ? "检测中…" : "重新检测"}
            </button>
            <button className="rs-btn" disabled={shots.length === 0} onClick={toggleMulti}>
              框选多选
            </button>
          </>
        )}
      </header>
      <div className="rs-timeline-scroll">
        <div className="rs-shot-grid">
          {shots.map((shot) => {
            const replaced = shot.imageResults.length > 0 || shot.videoResults.length > 0;
            const selected = multi ? selection.has(shot.id) : shot.id === selectedShotId;
            return (
              <div
                key={shot.id}
                className={`rs-shot-card${selected ? " selected" : ""}${replaced ? " replaced" : ""}`}
                aria-current={multi ? undefined : shot.id === selectedShotId}
                data-shot-id={shot.id}
                onClick={() => (multi ? toggleSelect(shot.id) : onSelectShot(shot.id))}
              >
                <div className="rs-shot-thumb">
                  {previews[shot.id] ? (
                    <img src={previews[shot.id]!} alt={shot.label} />
                  ) : (
                    <span className="rs-muted">…</span>
                  )}
                  {shot.people.length > 0 && (
                    <span className="rs-shot-person-count">{shot.people.length}人</span>
                  )}
                </div>
                <div className="rs-shot-meta">
                  <span className="rs-shot-name">{shot.label}</span>
                  <span className="rs-shot-duration">
                    {formatPrecise(shot.startSec)}–{formatPrecise(shot.endSec)}
                    {replaced ? " · 已生成" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {childrenExtra}
    </section>
  );
}

// ---------------------------------------------------------------------------
// 目标素材栏(人物/场景/音频/总素材)
// ---------------------------------------------------------------------------
export type RsAssetTab = "character" | "scene" | "audio" | "library";

export function TargetRail({
  project,
  activeTab,
  onTab,
  selectedCard,
  onSelectCard,
  onAddCharacter,
  onAddScene,
  onAddAppearance,
  onRemoveCard,
}: {
  project: RsProject;
  activeTab: RsAssetTab;
  onTab: (tab: RsAssetTab) => void;
  selectedCard: string | null;
  onSelectCard: (key: string | null) => void;
  onAddCharacter: () => void;
  onAddScene: () => void;
  onAddAppearance: (characterId: string) => void;
  onRemoveCard: (key: string) => void;
}) {
  const counts: Record<RsAssetTab, number> = {
    character: project.characters.length,
    scene: project.scenes.length,
    audio: project.audios.length,
    library: project.shots.reduce((n, s) => n + s.imageResults.length + s.videoResults.length, 0),
  };
  return (
    <aside className="rs-rail" aria-label="目标素材">
      <header className="rs-rail-heading">
        <strong>目标素材</strong>
        <span className="rs-muted">拖拽/点击角色卡建立人物引用</span>
      </header>
      <div className="rs-rail-tabs" role="tablist">
        {(["character", "scene", "audio", "library"] as RsAssetTab[]).map((tab) => (
          <button
            key={tab}
            className={`rs-rail-tab${activeTab === tab ? " active" : ""}`}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => onTab(tab)}
          >
            {tab === "character" ? "人物" : tab === "scene" ? "场景" : tab === "audio" ? "音频" : "总素材"}
            <span className="count">{counts[tab]}</span>
          </button>
        ))}
      </div>
      <div className="rs-rail-scroll">
        <div className="rs-rail-group">
          <div className="rs-rail-group-title">
            角色：
            <button className="rs-btn ghost" onClick={onAddCharacter}>＋ 新建角色</button>
          </div>
          {project.characters.length === 0 && (
            <p className="rs-muted" style={{ fontSize: 11, padding: "6px 2px" }}>
              请先在素材设定上传基础形象
            </p>
          )}
          {project.characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              selected={selectedCard === `character:${character.id}`}
              onSelect={() => onSelectCard(selectedCard === `character:${character.id}` ? null : `character:${character.id}`)}
              onAddAppearance={() => onAddAppearance(character.id)}
              onRemove={() => onRemoveCard(`character:${character.id}`)}
            />
          ))}
        </div>
        <div className="rs-rail-group">
          <div className="rs-rail-group-title">
            场景：
            <button className="rs-btn ghost" onClick={onAddScene}>＋ 新建场景</button>
          </div>
          {project.scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              selected={selectedCard === `scene:${scene.id}`}
              onSelect={() => onSelectCard(selectedCard === `scene:${scene.id}` ? null : `scene:${scene.id}`)}
              onRemove={() => onRemoveCard(`scene:${scene.id}`)}
            />
          ))}
          {project.scenes.length === 0 && (
            <p className="rs-muted" style={{ fontSize: 11, padding: "6px 2px" }}>没有场景素材</p>
          )}
        </div>
        <div className="rs-rail-group">
          <div className="rs-rail-group-title">音频：</div>
          {project.audios.length === 0 && (
            <p className="rs-muted" style={{ fontSize: 11, padding: "6px 2px" }}>没有音频素材（声音克隆参考音色）</p>
          )}
          {project.audios.map((audio) => (
            <div
              key={audio.id}
              className={`rs-target-card${selectedCard === `audio:${audio.id}` ? " selected" : ""}`}
              onClick={() => onSelectCard(selectedCard === `audio:${audio.id}` ? null : `audio:${audio.id}`)}
            >
              <AudioArtwork name={audio.name} />
              <div className="rs-target-card-copy">
                <strong>{audio.name}</strong>
                <small>{audio.durationSec ? `${audio.durationSec.toFixed(1)}s · 音色参考` : "音色参考"}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function CharacterCard({
  character,
  selected,
  onSelect,
  onAddAppearance,
  onRemove,
}: {
  character: RsTargetCharacter;
  selected: boolean;
  onSelect: () => void;
  onAddAppearance: () => void;
  onRemove: () => void;
}) {
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [appearanceIndex, setAppearanceIndex] = useState(0);
  useEffect(() => {
    const need = character.appearances.filter(
      (a) => a.imagePath && !(a.imagePath in previews),
    );
    if (need.length === 0) return;
    let cancelled = false;
    void ensureHostApi()
      .then((host) =>
        Promise.all(
          need.map(async (a) => {
            const url = await host.readImage(a.imagePath!).catch(() => null);
            return [a.imagePath!, url] as const;
          }),
        ),
      )
      .then((entries) => {
        if (cancelled) return;
        setPreviews((cur) => {
          const next = { ...cur };
          for (const [key, url] of entries) next[key] = url ?? null;
          return next;
        });
      })
      .catch(() => void 0);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.appearances]);
  const appearance = character.appearances[Math.min(appearanceIndex, character.appearances.length - 1)];
  return (
    <div
      className={`rs-target-card${selected ? " selected" : ""}`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          RS_CHARACTER_DRAG_TYPE,
          JSON.stringify({
            characterId: character.id,
            appearanceId: appearance?.imagePath ? appearance.id : null,
          }),
        );
        event.dataTransfer.effectAllowed = "copy";
      }}
      onClick={onSelect}
      title="拖拽到舞台人物框建立替换关系"
    >
      <div className="rs-target-card-media">
        {appearance?.imagePath && previews[appearance.imagePath] ? (
          <img src={previews[appearance.imagePath]!} alt={character.name} />
        ) : (
          <span className="rs-muted">无图</span>
        )}
        {character.appearances.length > 1 && (
          <div className="rs-arrows">
            <button
              className="rs-btn ghost"
              onClick={(e) => {
                e.stopPropagation();
                setAppearanceIndex((i) => (i - 1 + character.appearances.length) % character.appearances.length);
              }}
            >
              ‹
            </button>
            <button
              className="rs-btn ghost"
              onClick={(e) => {
                e.stopPropagation();
                setAppearanceIndex((i) => (i + 1) % character.appearances.length);
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>
      <div className="rs-target-card-copy">
        <strong>{character.name}</strong>
        <small>
          形象 {Math.min(appearanceIndex + 1, character.appearances.length)}/{character.appearances.length}
          {" · "}
          {character.boundLetters.length > 0
            ? `人物标记 ${character.boundLetters.join("/")}`
            : "未绑定人物"}
        </small>
      </div>
      <div className="rs-target-card-actions">
        <button
          className="rs-btn ghost"
          onClick={(e) => {
            e.stopPropagation();
            onAddAppearance();
          }}
        >
          ＋ 添加形象
        </button>
        <button
          className="rs-btn ghost danger"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          删除
        </button>
      </div>
    </div>
  );
}

function SceneCard({
  scene,
  selected,
  onSelect,
  onRemove,
}: {
  scene: RsScene;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!scene.imagePath) return;
    let cancelled = false;
    void ensureHostApi()
      .then((host) => host.readImage(scene.imagePath!))
      .then((url) => {
        if (!cancelled) setPreview(url);
      })
      .catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [scene.imagePath]);
  return (
    <div className={`rs-target-card${selected ? " selected" : ""}`} onClick={onSelect}>
      <div className="rs-target-card-media">
        {preview ? <img src={preview} alt={scene.name} /> : <span className="rs-muted">无图</span>}
      </div>
      <div className="rs-target-card-copy">
        <strong>{scene.name}</strong>
        <small>{scene.description || "场景参考图"}</small>
      </div>
      <div className="rs-target-card-actions">
        <button
          className="rs-btn ghost danger"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          删除
        </button>
      </div>
    </div>
  );
}

function AudioArtwork({ name }: { name: string }) {
  return <div className="rs-audio-artwork">♪ {name.slice(0, 8)}</div>;
}

// ---------------------------------------------------------------------------
// 生成面板骨架(上:预览 / 下:内容)
// ---------------------------------------------------------------------------
export function GenerationPanel({
  title,
  preview,
  children,
  footer,
}: {
  title: string;
  preview: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <aside className="rs-generation-panel">
      <header className="rs-generation-heading">
        <strong>{title}</strong>
      </header>
      <div className="rs-generation-preview">{preview}</div>
      <div className="rs-generation-copy">{children}</div>
      {footer && <div className="rs-generation-footer">{footer}</div>}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// 结果缩略图缓存(图片)
// ---------------------------------------------------------------------------
export function useImagePreview(path: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    void ensureHostApi()
      .then((host) => host.readImage(path))
      .then((data) => {
        if (!cancelled) setUrl(data);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);
  return url;
}

export function ResultPreviewOverlay({
  item,
  index,
  total,
  items,
  onPrev,
  onNext,
  onSelectIndex,
  onSetReference,
  onRemove,
  onDownload,
}: {
  item: RsGeneratedItem | null;
  index: number;
  total: number;
  items?: RsGeneratedItem[];
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex?: (index: number) => void;
  onSetReference?: (item: RsGeneratedItem) => void;
  onRemove?: (item: RsGeneratedItem) => void;
  onDownload: (item: RsGeneratedItem) => void;
}) {
  const image = useImagePreview(item?.kind === "image" ? item.outputPath : null);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="rs-preview-card">
      {item ? (
        item.kind === "image" ? (
          image ? <img src={image} alt="result" /> : <span className="rs-muted">加载中…</span>
        ) : (
          <video src={item.outputUrl} controls />
        )
      ) : (
        <div className="rs-preview-empty">替换图生成中 / 尚未生成</div>
      )}
      {total > 0 && (
        <button
          className="rs-preview-meta rs-version-toggle"
          title="版本历史"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {index + 1}/{total} · 版本 ▾
        </button>
      )}
      {menuOpen && items && items.length > 0 && (
        <div className="rs-version-menu">
          <div className="rs-version-menu-title">历史结果（点击切换）</div>
          {items.map((entry, i) => (
            <div
              key={entry.id}
              className={`rs-version-item${i === index ? " current" : ""}`}
              onClick={() => {
                onSelectIndex?.(i);
                setMenuOpen(false);
              }}
            >
              <span>
                图片 {i + 1}/{items.length}
                {i === index ? " · 当前使用" : ""}
              </span>
              <span className="rs-version-item-actions">
                <button
                  className="rs-btn ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSetReference?.(entry);
                    setMenuOpen(false);
                  }}
                >
                  设为参考
                </button>
                <button
                  className="rs-btn ghost danger"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove?.(entry);
                  }}
                >
                  删除
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
      {total > 1 && (
        <div className="rs-preview-arrows">
          <button className="rs-btn ghost" onClick={onPrev}>‹</button>
          <button className="rs-btn ghost" onClick={onNext}>›</button>
        </div>
      )}
      {item && (
        <div className="rs-preview-actions">
          <button className="rs-btn ghost" onClick={() => onDownload(item)}>
            在文件夹中显示
          </button>
          {onSetReference && item.kind === "image" && (
            <button className="rs-btn ghost" onClick={() => onSetReference(item)}>
              设为参考
            </button>
          )}
          {onRemove && (
            <button className="rs-btn ghost danger" onClick={() => onRemove(item)}>
              删除
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function clusterForPerson(project: RsProject, person: RsPerson): RsSourceCharacter | null {
  return project.sourceCharacters.find((c) => c.id === person.sourceCharacterId) ?? null;
}

export function utilError(reason: unknown): string {
  return errorText(reason);
}

// ---------------------------------------------------------------------------
// 身份绑定列表(身份 → 目标角色/形象/替换范围)
// ---------------------------------------------------------------------------
export function BindingList({
  project,
  onChange,
  compact,
}: {
  project: RsProject;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
  compact?: boolean;
}) {
  const setCluster = (id: string, patch: Partial<RsSourceCharacter>) =>
    void onChange((p) => ({
      ...p,
      sourceCharacters: p.sourceCharacters.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    }));
  const removeCluster = (id: string) =>
    void onChange((p) => ({
      ...p,
      sourceCharacters: p.sourceCharacters.filter((c) => c.id !== id),
      shots: p.shots.map((s) => ({
        ...s,
        people: s.people.map((person) =>
          person.sourceCharacterId === id ? { ...person, sourceCharacterId: null } : person,
        ),
      })),
    }));
  if (project.sourceCharacters.length === 0) {
    return <p className="rs-muted">尚未聚类出身份（请先完成镜头检测）</p>;
  }
  return (
    <div className="rs-binding-list">
      {project.sourceCharacters.map((cluster) => (
        <div key={cluster.id} className={`rs-binding-item${compact ? " compact" : ""}`}>
          <div className="rs-binding-head">
            <span className="rs-tag" style={{ borderColor: guideColor(RS_LETTER_INDEX(cluster.letter)), color: guideColor(RS_LETTER_INDEX(cluster.letter)) }}>
              {cluster.label}
            </span>
            <span className="rs-muted" style={{ flex: 1, fontSize: 11 }}>
              {cluster.description || "无描述"} · {cluster.personIds.length} 个镜头出现
            </span>
            <button className="rs-btn ghost danger" onClick={() => removeCluster(cluster.id)}>
              删除
            </button>
          </div>
          <div className="rs-field" style={{ marginBottom: 6 }}>
            <span>绑定目标角色/形象</span>
            <div className="rs-row" style={{ gap: 8 }}>
              <select
                value={cluster.targetCharacterId ?? ""}
                onChange={(event) => {
                  const characterId = event.target.value || null;
                  const target = project.characters.find((c) => c.id === characterId);
                  setCluster(cluster.id, {
                    targetCharacterId: characterId,
                    targetAppearanceId: target?.appearances[0]?.id ?? null,
                  });
                }}
              >
                <option value="">未绑定</option>
                {project.characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {cluster.targetCharacterId && (
                <select
                  value={cluster.targetAppearanceId ?? ""}
                  onChange={(event) => setCluster(cluster.id, { targetAppearanceId: event.target.value || null })}
                >
                  {(project.characters.find((c) => c.id === cluster.targetCharacterId)?.appearances ?? []).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.id}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="rs-field" style={{ marginBottom: 0 }}>
            <span>替换范围</span>
            <select value={cluster.scope} onChange={(event) => setCluster(cluster.id, { scope: event.target.value as RsSourceCharacter["scope"] })}>
              {(Object.keys(RS_SCOPE_LABELS) as RsSourceCharacter["scope"][]).map((scope) => (
                <option key={scope} value={scope}>
                  {RS_SCOPE_LABELS[scope]}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

function RS_LETTER_INDEX(letter: string): number {
  const index = "ABCDEFGH".indexOf(letter);
  return index >= 0 ? index : 0;
}