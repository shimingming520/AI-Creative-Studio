/**
 * 步骤 4/5 · 声音克隆 & 合成视频。
 * 声音克隆:逐镜头台词(可转写) + 目标角色音色参考 → YUH IndexTTS 克隆。
 * 合成视频:镜头片段素材化(FFmpeg)+ 克隆音轨对齐 → 拼接混流导出。
 */
import { useMemo, useState } from "react";
import {
  rsId,
  type RsGeneratedItem,
  type RsProject,
  type RsShot,
  type RsSourceCharacter,
} from "../../shared/replacement-studio";
import { ensureHostApi, errorText } from "./host";
import { ShotTimeline, formatPrecise, useImagePreview } from "./StudioParts";

export function StudioVoiceStep({
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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const shot = project.shots.find((s) => s.id === selectedShot?.id) ?? project.shots[0] ?? null;
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  const voiceRef = useMemo(() => {
    const audio = activeAudioId
      ? project.audios.find((a) => a.id === activeAudioId)
      : project.audios.find((a) => a.targetCharacterId);
    return audio ?? project.audios[0] ?? null;
  }, [project.audios, activeAudioId]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (reason) {
      setMessage(`${label}失败: ${errorText(reason)}`);
    } finally {
      setBusy(false);
    }
  };

  const transcribeShot = () =>
    run("转写台词", async () => {
      if (!shot) return;
      const source = project.sources[0];
      if (!source || source.kind !== "video") throw new Error("语音转写需要视频素材（先按镜头裁出音频）");
      const host = await ensureHostApi();
      // 简便做法:用源视频音频整体转写后按镜头时间取对应文本(近似)。
      const result = await host.transcribe({
        audioPath: source.path,
        providerId: project.settings.providerId,
        language: project.settings.voiceLang,
      });
      if (!result.text) throw new Error("转写没有返回文本(检查中转站是否支持 Whisper 语音识别)");
      await onChange((p) => ({
        ...p,
        shots: p.shots.map((s) => (s.id === shot.id ? { ...s, voiceText: result.text } : s)),
      }));
    });

  const cloneShot = () =>
    run("克隆配音", async () => {
      if (!shot) return;
      if (!voiceRef) throw new Error("请先在素材库音频 Tab 添加音色参考（或绑定目标角色音色）");
      const host = await ensureHostApi();
      const text = shot.voiceText.trim();
      if (!text) throw new Error("请先填写台词文本（可点击「转写原声」或手动输入）");
      await onChange((p) => ({
        ...p,
        shots: p.shots.map((s) => (s.id === shot.id ? { ...s, voiceStatus: "generating" as const, voiceError: null } : s)),
      }));
      const result = await host.cloneVoice({
        text,
        refAudioPath: voiceRef.path,
        lang: project.settings.voiceLang,
      });
      await onChange((p) => ({
        ...p,
        shots: p.shots.map((s) =>
          s.id === shot.id ? { ...s, voiceAudioPath: result.outputPath, voiceStatus: "done" as const, voiceError: null } : s,
        ),
      }));
    });

  const cloneAll = () =>
    run("批量克隆", async () => {
      if (!voiceRef) throw new Error("请先添加音色参考音频");
      const host = await ensureHostApi();
      for (const s of project.shots) {
        const text = s.voiceText.trim();
        if (!text) continue;
        try {
          const result = await host.cloneVoice({
            text,
            refAudioPath: voiceRef.path,
            lang: project.settings.voiceLang,
          });
          await onChange((p) => ({
            ...p,
            shots: p.shots.map((x) =>
              x.id === s.id ? { ...x, voiceAudioPath: result.outputPath, voiceStatus: "done" as const, voiceError: null } : x,
            ),
          }));
        } catch (reason) {
          await onChange((p) => ({
            ...p,
            shots: p.shots.map((x) =>
              x.id === s.id ? { ...x, voiceStatus: "error" as const, voiceError: errorText(reason) } : x,
            ),
          }));
        }
      }
    });

  if (!shot) {
    return <div className="rs-banner warn" style={{ margin: 16 }}>请先在素材设定导入素材。</div>;
  }

  return (
    <div className="rs-voice-layout">
      <aside className="rs-rail">
        <header className="rs-rail-heading">
          <strong>声音克隆</strong>
          <span className="rs-muted">选择目标音色（音频素材）</span>
        </header>
        <div className="rs-rail-scroll">
          {project.audios.length === 0 && (
            <p className="rs-muted" style={{ fontSize: 11, padding: 6 }}>
              没有音频素材。请回到「素材设定 → 音频」添加目标角色的音色参考（mp3/wav）。
            </p>
          )}
          {project.audios.map((audio) => (
            <div
              key={audio.id}
              className={`rs-target-card${activeAudioId === audio.id ? " selected" : ""}`}
              onClick={() => setActiveAudioId(audio.id)}
            >
              <div className="rs-target-card-media">
                <audio src={"file:///" + audio.path.replace(/\\/g, "/")} controls preload="none" />
              </div>
              <div className="rs-target-card-copy">
                <strong>{audio.name}</strong>
                <small>音色参考 · 已绑定角色: {(project.characters.find((c) => c.id === audio.targetCharacterId)?.name ?? "未绑定")}</small>
              </div>
            </div>
          ))}
        </div>
      </aside>
      <div className="rs-center">
        <section className="rs-panel">
          <h3>
            当前镜头 · 台词
            <span className="hint">{shot.label} · {formatPrecise(shot.startSec)} → {formatPrecise(shot.endSec)}</span>
          </h3>
          <div className="rs-field">
            <textarea
              rows={6}
              value={shot.voiceText}
              placeholder="该镜头台词文本（点击「转写原声」自动识别，或手动输入）"
              onChange={(event) =>
                void onChange((p) => ({
                  ...p,
                  shots: p.shots.map((s) => (s.id === shot.id ? { ...s, voiceText: event.target.value } : s)),
                }))
              }
            />
          </div>
          <div className="rs-row">
            <button className="rs-btn" disabled={busy || !project.settings.providerId} onClick={() => void transcribeShot()}>
              转写原声
            </button>
            <button className="rs-btn primary" disabled={busy || !voiceRef} onClick={() => void cloneShot()}>
              {busy ? <span className="rs-spinner" /> : null}
              {shot.voiceStatus === "generating" ? "克隆中…" : "生成克隆配音"}
            </button>
            <button className="rs-btn" disabled={busy || !voiceRef} onClick={() => void cloneAll()}>
              批量克隆（{project.shots.length}）
            </button>
            {voiceRef && (
              <audio
                src={"file:///" + voiceRef.path.replace(/\\/g, "/")}
                controls
                style={{ height: 30, maxWidth: 260 }}
              />
            )}
          </div>
          {message && <div className="rs-banner error" style={{ marginTop: 8 }}>{message}</div>}
        </section>
        <section className="rs-panel">
          <h3>
            当前镜头 · 克隆结果
            <span className="hint">合成时该音轨会与镜头时长对齐混合</span>
          </h3>
          {shot.voiceAudioPath ? (
            <audio
              src={"file:///" + shot.voiceAudioPath.replace(/\\/g, "/")}
              controls
              style={{ width: "100%", height: 40 }}
            />
          ) : (
            <p className="rs-muted">尚未生成。点击「生成克隆配音」开始。</p>
          )}
          {shot.voiceError && <div className="rs-banner error">{shot.voiceError}</div>}
        </section>
        <ShotTimeline
          shots={project.shots}
          selectedShotId={shot.id}
          onSelectShot={onSelectShot}
          onDetectAll={() => void 0}
          onDeleteShots={() => void 0}
          busy={busy}
          detectBusy={false}
        />
      </div>
      <aside className="rs-detail">
        <section className="rs-panel">
          <h3>进度</h3>
          <div className="rs-row">
            <span className="rs-tag">{project.shots.filter((s) => s.voiceAudioPath).length}/{project.shots.length} 已克隆</span>
            <span className="rs-tag">{project.shots.filter((s) => s.voiceText.trim()).length} 有台词</span>
          </div>
          <p className="rs-muted" style={{ marginTop: 8 }}>
            未克隆的镜头在合成时保留原声。克隆配音依赖 YUH 内置 IndexTTS（首次使用请先在其设置中启动）。
          </p>
        </section>
        <section className="rs-panel">
          <h3>音轨策略</h3>
          <label className="rs-field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={project.settings.composeAudioEnabled}
              onChange={(event) =>
                void onChange((p) => ({ ...p, settings: { ...p.settings, composeAudioEnabled: event.target.checked } }))
              }
            />
            合成时使用克隆音轨
          </label>
        </section>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 合成视频
// ---------------------------------------------------------------------------
export function StudioComposeStep({
  project,
  onChange,
}: {
  project: RsProject;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [composeShotIds, setComposeShotIds] = useState<string[]>([]);

  const shotsWithOutput = project.shots.filter(
    (s) => s.videoResults.length > 0 || s.imageResults.length > 0,
  );
  const final = project.compose.finalVideoPath ?? null;

  const composeAll = async () => {
    setBusy(true);
    setMessage("");
    try {
      const host = await ensureHostApi();
      const outputDir = (await host.workspace()).outputDir;
      if (!outputDir) throw new Error("请先在 YUH 存储设置中选择输出文件夹");
      await onChange((p) => ({
        ...p,
        compose: { ...p.compose, status: "running" as const, error: null },
      }));
      const parts: { videoPath: string; durationSec: number; audioPath?: string | null }[] = [];
      const ids: string[] = [];
      for (const shot of project.shots) {
        let videoPath = shot.videoPath;
        if (!videoPath) {
          const source = project.sources.find((s) => s.id === shot.sourceId);
          if (source && source.kind === "video") {
            const clip = await host.materializeShot({
              file: source.path,
              startSec: shot.startSec,
              durationSec: shot.durationSec,
              outputDir,
            });
            videoPath = clip.path;
            await onChange((p) => ({
              ...p,
              shots: p.shots.map((s) => (s.id === shot.id ? { ...s, videoPath: clip.path } : s)),
            }));
          }
        }
        if (!videoPath) continue;
        parts.push({
          videoPath,
          durationSec: shot.durationSec,
          audioPath: project.settings.composeAudioEnabled ? (shot.voiceAudioPath ?? null) : null,
        });
        ids.push(shot.id);
      }
      if (parts.length === 0) throw new Error("没有可合成的镜头片段（需要视频素材）");
      const savedPath = await host.saveFileDialog({
        title: "保存合成视频",
        defaultName: `${project.title}-替换视频.mp4`,
        filters: [{ name: "视频", extensions: ["mp4"] }],
      });
      if (!savedPath) {
        await onChange((p) => ({ ...p, compose: { ...p.compose, status: "idle" as const, error: null } }));
        return;
      }
      const result = await host.compose({ shots: parts, outputPath: savedPath });
      await onChange((p) => ({
        ...p,
        compose: { ...p.compose, finalVideoPath: result.outputPath, status: "done" as const, error: null, composedShotIds: ids },
      }));
      setComposeShotIds(ids);
    } catch (reason) {
      setMessage(`合成失败: ${errorText(reason)}`);
      await onChange((p) => ({ ...p, compose: { ...p.compose, status: "error" as const, error: errorText(reason) } }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rs-compose-layout">
      <section className="rs-panel" style={{ flex: "1 1 460px" }}>
        <h3>
          合成视频
          <span className="hint">按镜头顺序拼接并混流；未生成替换视频的镜头保留原片段</span>
        </h3>
        {message && <div className="rs-banner error">{message}</div>}
        <div className="rs-row" style={{ marginTop: 8 }}>
          <span className="rs-tag">{project.shots.length} 镜头</span>
          <span className="rs-tag">{shotsWithOutput.length} 已替换</span>
          <span className="rs-tag">
            {project.shots.filter((s) => s.voiceAudioPath).length} 克隆音轨
          </span>
        </div>
        <div className="rs-row" style={{ marginTop: 12 }}>
          <button className="rs-btn primary" disabled={busy || project.shots.length === 0} onClick={() => void composeAll()}>
            {busy ? <span className="rs-spinner" /> : null}
            {project.compose.status === "running" ? "合成中…" : "合成全部视频并导出"}
          </button>
        </div>
        {project.compose.status === "running" && (
          <div className="rs-progress" style={{ marginTop: 10 }}>
            <div className="fill" style={{ width: "100%" }} />
          </div>
        )}
      </section>
      <section className="rs-panel" style={{ flex: "1 1 460px" }}>
        <h3>
          最终成品
          <span className="hint">{final ? project.compose.composedShotIds.length : 0} 个镜头参与合成</span>
        </h3>
        {final ? (
          <video
            src={"file:///" + final.replace(/\\/g, "/")}
            controls
            style={{ width: "100%", maxHeight: 420, background: "#0b0b0d", borderRadius: 8 }}
          />
        ) : (
          <div className="rs-empty">合成完成后在此预览最终视频</div>
        )}
        {final && (
          <div className="rs-row" style={{ marginTop: 8 }}>
            <button
              className="rs-btn"
              onClick={() => void ensureHostApi().then((host) => host.showItem(final).catch(() => void 0))}
            >
              在文件夹中显示
            </button>
          </div>
        )}
      </section>
      <aside className="rs-detail">
        <section className="rs-panel">
          <h3>镜头合成状态</h3>
          <div className="rs-history" style={{ maxHeight: 300 }}>
            {project.shots.map((shot) => (
              <div className="rs-history-item" key={shot.id}>
                <span className={`kind ${shot.videoResults.length > 0 ? "video" : "image"}`}>
                  {shot.videoResults.length > 0 ? "视频" : shot.imageResults.length > 0 ? "图" : "原片"}
                </span>
                <span className="prompt">{shot.label}</span>
                <span className="time">{shot.voiceAudioPath ? "含克隆音轨" : "原声"}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

export type { RsGeneratedItem, RsSourceCharacter };
export { rsId };
