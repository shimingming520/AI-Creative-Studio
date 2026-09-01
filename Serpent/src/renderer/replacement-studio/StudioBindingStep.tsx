/**
 * 步骤 2 · 人物绑定:在基础图上框选人物(AI 检测或手动框选),
 * 为每个人物绑定目标角色/形象与替换范围。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  charLabel,
  parseDetectedPeople,
  rsId,
  RS_SCOPE_LABELS,
  type RsBbox,
  type RsProject,
  type RsScope,
  type RsSourceCharacter,
} from "../../shared/replacement-studio";
import { ensureHostApi, errorText, type RsProviderInfo } from "./host";
import { guideColor, guideBoxesForCharacters } from "./guide-image";

export function StudioBindingStep({
  project,
  onChange,
}: {
  project: RsProject;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RsBbox | null>(null);
  const [providers, setProviders] = useState<RsProviderInfo[]>([]);
  const [imageData, setImageData] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const base = project.base;
  const keyframePath = base?.keyframePath ?? null;

  useEffect(() => {
    if (!keyframePath) return;
    let cancelled = false;
    void ensureHostApi()
      .then((host) => host.readImage(keyframePath))
      .then((dataUrl) => {
        if (!cancelled) setImageData(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setImageData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [keyframePath]);

  useEffect(() => {
    void ensureHostApi()
      .then((host) => host.listProviders())
      .then((list) => setProviders((list || []).filter((p) => p.enabled && p.hasApiKey)))
      .catch(() => void 0);
  }, []);

  const characterLabels = useMemo(() => {
    const labels = new Set(project.sourceCharacters.map((c) => c.label));
    return labels;
  }, [project.sourceCharacters]);

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

  const detectPeople = () =>
    run("智能检测", async () => {
      const host = await ensureHostApi();
      if (!keyframePath) throw new Error("请先在「素材设定」选择基础图片或视频");
      const settings = project.settings;
      if (!settings.detectProviderId) throw new Error("请先选择检测中转站（可在下方检测设置中选择）");
      if (!settings.detectModel.trim())
        throw new Error("请填写检测模型（视觉模型，例如 qwen-vl-max）");
      const result = await host.detectPeople({
        providerId: settings.detectProviderId,
        model: settings.detectModel.trim(),
        prompt: settings.detectPrompt,
        imagePath: keyframePath,
      });
      const people = parseDetectedPeople(result?.text || "");
      if (people.length === 0) {
        throw new Error("未检测到人物，请重试或使用手动框选");
      }
      if (people.length > 8) people.length = 8;
      const existing = project.sourceCharacters;
      const next: RsSourceCharacter[] = people.map((person, index) => {
        const existingIndex = existing.findIndex(
          (c, i) => i === index && c.method === "manual" && c.bbox === person.bbox,
        );
        const label = nextLabel(existing, index, person.labelHint);
        return {
          id: rsId("sc"),
          label,
          bbox: person.bbox,
          method: "auto",
          confidence: person.confidence,
          scope: "full-person",
          targetCharacterId: null,
          targetAppearanceId: null,
          ...(existingIndex >= 0
            ? {
                id: existing[existingIndex]!.id,
                scope: existing[existingIndex]!.scope,
                targetCharacterId: existing[existingIndex]!.targetCharacterId,
                targetAppearanceId: existing[existingIndex]!.targetAppearanceId,
              }
            : {}),
        };
      });
      await onChange((project) => ({ ...project, sourceCharacters: next }));
      setSelectedId(next[0]?.id ?? null);
      setMessage(`检测到 ${next.length} 个人物，请为每个人物绑定目标形象。`);
    });

  const appendManualBox = (bbox: RsBbox) => {
    const nextCharacter: RsSourceCharacter = {
      id: rsId("sc"),
      label: nextLabel(project.sourceCharacters, project.sourceCharacters.length, null),
      bbox,
      method: "manual",
      confidence: null,
      scope: "full-person",
      targetCharacterId: null,
      targetAppearanceId: null,
    };
    setSelectedId(nextCharacter.id);
    void onChange((project) => ({
      ...project,
      sourceCharacters: [...project.sourceCharacters, nextCharacter],
    }));
  };

  const updateCharacter = (id: string, patch: Partial<RsSourceCharacter>) => {
    void onChange((project) => ({
      ...project,
      sourceCharacters: project.sourceCharacters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const removeCharacter = (id: string) => {
    if (selectedId === id) setSelectedId(null);
    void onChange((project) => ({
      ...project,
      sourceCharacters: project.sourceCharacters.filter((c) => c.id !== id),
    }));
  };

  const clearCharacters = () => {
    setSelectedId(null);
    void onChange((project) => ({ ...project, sourceCharacters: [] }));
  };

  // --- 手动框选(pointer 事件,百分比坐标) ---
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drawing) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    dragStart.current = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
    setDraft({ x: dragStart.current.x, y: dragStart.current.y, w: 0, h: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drawing || !dragStart.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const x0 = Math.max(0, Math.min(1, Math.min(dragStart.current.x, x)));
    const y0 = Math.max(0, Math.min(1, Math.min(dragStart.current.y, y)));
    const w = Math.min(1 - x0, Math.abs(x - dragStart.current.x));
    const h = Math.min(1 - y0, Math.abs(y - dragStart.current.y));
    setDraft({ x: x0, y: y0, w, h });
  };
  const onPointerUp = () => {
    dragStart.current = null;
    if (draft && draft.w > 0.015 && draft.h > 0.015) appendManualBox(draft);
    setDraft(null);
    setDrawing(false);
  };

  const selected = project.sourceCharacters.find((c) => c.id === selectedId) ?? null;
  const boxes = guideBoxesForCharacters(project.sourceCharacters);

  if (!base) {
    return (
      <div className="rs-editor">
        <div className="rs-banner warn">请先在「素材设定」中选择基础图片或视频。</div>
      </div>
    );
  }

  return (
    <div className="rs-editor">
      {message && (
        <div className="rs-banner info" style={{ marginBottom: 0 }}>
          {message}
          <button className="rs-btn ghost" onClick={() => setMessage("")}>
            关闭
          </button>
        </div>
      )}

      <div className="rs-grid">
        <section className="rs-panel">
          <h3>
            人物定位
            <span className="hint">绿色圆点=AI检测 · 黄色圆点=手动框选 · 点击边框选中人物</span>
          </h3>
          <div className="rs-row" style={{ marginBottom: 10 }}>
            <button
              className={`rs-btn ${drawing ? "primary" : ""}`}
              disabled={busy || !imageData}
              onClick={() => setDrawing((v) => !v)}
            >
              {drawing ? "拖动画框中…" : "手动框选"}
            </button>
            <button className="rs-btn" disabled={busy || !imageData} onClick={() => void detectPeople()}>
              {busy ? <span className="rs-spinner" /> : null}
              AI 智能检测
            </button>
            <button className="rs-btn ghost" disabled={project.sourceCharacters.length === 0} onClick={clearCharacters}>
              清空全部
            </button>
            {selected && (
              <button className="rs-btn danger" onClick={() => removeCharacter(selected.id)}>
                删除选中
              </button>
            )}
            <span style={{ flex: 1 }} />
            <span className="rs-tag">{project.sourceCharacters.length} 人</span>
          </div>

          {imageData ? (
            <div
              ref={stageRef}
              className="rs-canvas-wrap"
              style={{ cursor: drawing ? "crosshair" : "default", maxWidth: 920 }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <img src={imageData} alt="基础图" draggable={false} style={{ width: "100%", display: "block" }} />
              <div className="rs-boxes">
                {boxes.map((box, index) => {
                  const character = project.sourceCharacters[index];
                  if (!character) return null;
                  const isSelected = character.id === selectedId;
                  return (
                    <div
                      key={character.id}
                      className={`rs-box ${character.method === "auto" ? "automated" : "manual"}${isSelected ? " selected" : ""}`}
                      style={
                        {
                          left: `${box.bbox.x * 100}%`,
                          top: `${box.bbox.y * 100}%`,
                          width: `${box.bbox.w * 100}%`,
                          height: `${box.bbox.h * 100}%`,
                          "--box-color": guideColor(index),
                          ...(isSelected ? { borderWidth: 3, zIndex: 2 } : {}),
                        } as React.CSSProperties
                      }
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        setSelectedId(character.id);
                      }}
                      title={`${box.letter} · ${box.bbox.w.toFixed(2)}x${box.bbox.h.toFixed(2)}`}
                    >
                      <span className="letter">
                        {box.letter}·{character.label.replace("人物", "")}
                      </span>
                    </div>
                  );
                })}
                {draft && (
                  <div
                    className="rs-box"
                    style={{
                      left: `${draft.x * 100}%`,
                      top: `${draft.y * 100}%`,
                      width: `${draft.w * 100}%`,
                      height: `${draft.h * 100}%`,
                      borderStyle: "dashed",
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="rs-empty">正在加载基础图… 若长时间无显示，请检查文件是否存在。</div>
          )}

          <p className="rs-muted" style={{ marginTop: 8 }}>
            提示：自动检测通过所选视觉大模型识别 bbox；检测不准时可用「手动框选」拖动修正，或删除后重新框选。
          </p>
        </section>

        <section className="rs-panel">
          <h3>
            人物绑定
            <span className="hint">把原图中的人物连接到目标形象</span>
          </h3>
          {project.sourceCharacters.length === 0 ? (
            <div className="rs-empty">
              先用「AI 智能检测」自动识别人物，或点击「手动框选」在图上绘制。
            </div>
          ) : (
            <div className="rs-col" style={{ gap: 8 }}>
              {project.sourceCharacters.map((character, index) => (
                <div
                  key={character.id}
                  style={{
                    border: `1px solid ${selectedId === character.id ? "#3d8a63" : "#26262b"}`,
                    borderRadius: 8,
                    padding: 8,
                    background: "#131316",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedId(character.id)}
                >
                  <div className="rs-row" style={{ alignItems: "center" }}>
                    <span
                      className="rs-tag"
                      style={{ borderColor: guideColor(index), color: guideColor(index) }}
                    >
                      {character.label}
                    </span>
                    <span className="rs-muted" style={{ fontSize: 11 }}>
                      {character.method === "auto" ? `AI 检测${character.confidence !== null ? ` ${Math.round(character.confidence * 100)}%` : ""}` : "手动框选"}
                    </span>
                    <span style={{ flex: 1 }} />
                    <button
                      className="rs-btn ghost danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeCharacter(character.id);
                      }}
                    >
                      删除
                    </button>
                  </div>
                  <div className="rs-field" style={{ marginTop: 6, marginBottom: 6 }}>
                    <span>替换范围</span>
                    <select
                      value={character.scope}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => updateCharacter(character.id, { scope: event.target.value as RsScope })}
                    >
                      {(Object.keys(RS_SCOPE_LABELS) as RsScope[]).map((scope) => (
                        <option key={scope} value={scope}>
                          {RS_SCOPE_LABELS[scope]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rs-field" style={{ marginBottom: 4 }}>
                    <span>绑定目标角色/形象</span>
                    <select
                      value={character.targetCharacterId ?? ""}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        const characterId = event.target.value || null;
                        const target = project.targetCharacters.find((c) => c.id === characterId);
                        const appearanceId = target?.appearances[0]?.id ?? null;
                        updateCharacter(character.id, { targetCharacterId: characterId, targetAppearanceId: appearanceId });
                      }}
                    >
                      <option value="">未绑定</option>
                      {project.targetCharacters.map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {character.targetCharacterId && (
                    <div className="rs-field" style={{ marginBottom: 0 }}>
                      <span>使用形象</span>
                      <select
                        value={character.targetAppearanceId ?? ""}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          updateCharacter(character.id, { targetAppearanceId: event.target.value || null })
                        }
                      >
                        {(project.targetCharacters.find((c) => c.id === character.targetCharacterId)?.appearances ?? []).map(
                          (appearance) => (
                            <option key={appearance.id} value={appearance.id}>
                              {appearance.name || appearance.id}
                            </option>
                          ),
                        )}
                        {character.targetAppearanceId && (
                          <option value="">（先选择形象）</option>
                        )}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12, borderTop: "1px solid #26262b", paddingTop: 10 }}>
            <h3 style={{ fontSize: 12.5 }}>检测设置</h3>
            <div className="rs-field">
              <span>检测中转站（视觉模型）</span>
              <select
                value={project.settings.detectProviderId}
                onChange={(event) =>
                  void onChange((project) => ({
                    ...project,
                    settings: { ...project.settings, detectProviderId: event.target.value },
                  }))
                }
              >
                <option value="">选择中转站…</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                    {!provider.hasApiKey ? "（未配置 Key）" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="rs-field">
              <span>检测模型（视觉模型 ID）</span>
              <input
                value={project.settings.detectModel}
                placeholder="例如 qwen-vl-max / gpt-4.1-mini / gemini-2.5-flash"
                onChange={(event) =>
                  void onChange((project) => ({
                    ...project,
                    settings: { ...project.settings, detectModel: event.target.value },
                  }))
                }
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function nextLabel(
  existing: RsSourceCharacter[],
  index: number,
  hint: string | null,
): string {
  if (hint && /^人物[A-H]$/.test(hint)) return hint;
  if (existing.length > 0) {
    const used = new Set(existing.map((c) => c.label));
    for (let i = 0; i < 8; i += 1) {
      const candidate = charLabel(i);
      if (!used.has(candidate)) return candidate;
    }
  }
  return charLabel(index);
}

export { charLabel };
