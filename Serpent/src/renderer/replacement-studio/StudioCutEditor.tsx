/**
 * 切口剪辑器 — 近似 ShuoCanvas shot-cut-editor(FFmpeg 场景检测基础上的人工调整):
 * 边界拖拽 / 合并到上一镜头 / 从中间拆分 / 倒放标记 / 重新抽帧。
 */
import { useRef, useState } from "react";
import {
  rsId,
  type RsProject,
  type RsShot,
  type RsSource,
} from "../../shared/replacement-studio";
import { ensureHostApi, errorText } from "./host";
import { formatPrecise } from "./StudioParts";

export function StudioCutEditor({
  project,
  shot,
  source,
  onChange,
  onSelectShot,
}: {
  project: RsProject;
  shot: RsShot;
  source: RsSource | null;
  onChange: (mutator: (p: RsProject) => RsProject) => Promise<void>;
  onSelectShot: (shotId: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const drag = useRef<{ side: "left" | "right"; startClientX: number; startSec: number } | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const total = Math.max(1, source?.durationSec ?? shot.endSec);

  const index = project.shots.findIndex((s) => s.id === shot.id);
  const prev = project.shots[index - 1] ?? null;
  const next = project.shots[index + 1] ?? null;

  const onMoveBoundary = (clientX: number) => {
    const track = trackRef.current;
    if (!track || !drag.current) return;
    const rect = track.getBoundingClientRect();
    const deltaSec = ((clientX - drag.current.startClientX) / Math.max(1, rect.width)) * total;
    const target = drag.current.startSec + deltaSec;
    if (drag.current.side === "left") {
      const min = prev ? prev.endSec + 0.2 : 0;
      const max = shot.endSec - 0.2;
      const startSec = Math.round(Math.max(min, Math.min(max, target)) * 100) / 100;
      void onChange((p) => ({
        ...p,
        shots: p.shots.map((s) =>
          s.id === shot.id
            ? {
                ...s,
                startSec,
                durationSec: Math.round((s.endSec - startSec) * 100) / 100,
              }
            : s,
        ),
      }));
    } else {
      const min = shot.startSec + 0.2;
      const max = next ? next.startSec - 0.2 : total;
      const endSec = Math.round(Math.max(min, Math.min(max, target)) * 100) / 100;
      void onChange((p) => ({
        ...p,
        shots: p.shots.map((s) =>
          s.id === shot.id
            ? {
                ...s,
                endSec,
                durationSec: Math.round((endSec - s.startSec) * 100) / 100,
              }
            : s,
        ),
      }));
    }
  };

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

  const mergeUp = () =>
    run("合并", async () => {
      if (!prev) return;
      await onChange((p) => ({
        ...p,
        shots: p.shots
          .map((s) =>
            s.id === prev.id ? { ...s, endSec: shot.endSec, durationSec: Math.round((shot.endSec - s.startSec) * 100) / 100 } : s,
          )
          .filter((s) => s.id !== shot.id),
      }));
      onSelectShot(prev.id);
    });

  const splitMid = () =>
    run("拆分", async () => {
      const mid = Math.round((shot.startSec + shot.endSec) / 2 * 100) / 100;
      const nextShot: RsShot = {
        ...shot,
        id: rsId("shot"),
        index: index + 1,
        label: `镜头${index + 2}`,
        startSec: mid,
        endSec: shot.endSec,
        durationSec: Math.round((shot.endSec - mid) * 100) / 100,
        keyframeTimeSec: Math.round((mid + 0.3) * 100) / 100,
        keyframePath: null,
        people: [],
        detectionStatus: "idle" as const,
        detectionError: null,
        imagePrompt: "",
        imageResults: [],
        imageActiveIndex: 0,
        imageStatus: "idle" as const,
        imageError: null,
        referenceImagePath: null,
        videoPrompt: "",
        videoResults: [],
        videoActiveIndex: 0,
        videoStatus: "idle" as const,
        videoError: null,
        reversed: shot.reversed,
        voiceText: "",
        voiceAudioPath: null,
        voiceStatus: "idle" as const,
        voiceError: null,
        selected: true,
      };
      await onChange((p) => {
        const shots = [...p.shots];
        const i = shots.findIndex((s) => s.id === shot.id);
        if (i < 0) return p;
        const result = [...shots];
        result[i] = {
          ...result[i]!,
          endSec: mid,
          durationSec: Math.round((mid - result[i]!.startSec) * 100) / 100,
        };
        result.splice(i + 1, 0, nextShot);
        return { ...p, shots: result };
      });
      onSelectShot(nextShot.id);
    });

  const toggleReverse = () =>
    run("倒放", async () => {
      await onChange((p) => ({
        ...p,
        shots: p.shots.map((s) => (s.id === shot.id ? { ...s, reversed: !s.reversed } : s)),
      }));
    });

  const rekeyframe = () =>
    run("重新抽帧", async () => {
      if (!source || source.kind !== "video") throw new Error("需要视频素材");
      const host = await ensureHostApi();
      const frame = await host.extractFrameAt({
        file: source.path,
        timeSec: Math.min(
          shot.startSec + Math.min(0.6, shot.durationSec * 0.35),
          shot.endSec - 0.05,
        ),
      });
      const timeSec = Math.round((shot.startSec + Math.min(0.6, shot.durationSec * 0.35)) * 100) / 100;
      await onChange((p) => ({
        ...p,
        shots: p.shots.map((s) =>
          s.id === shot.id
            ? { ...s, keyframePath: frame.path, keyframeTimeSec: timeSec }
            : s,
        ),
      }));
    });

  return (
    <section className="rs-cut-editor" aria-label="调整镜头切口">
      <header>
        <strong style={{ fontSize: 12.5, color: "#e8e9ec" }}>切口编辑（{shot.label}）</strong>
        <span className="rs-cut-time">
          {formatPrecise(shot.startSec)} → {formatPrecise(shot.endSec)} · {shot.durationSec.toFixed(2)}s
        </span>
        <span style={{ flex: 1 }} />
        <span className="rs-tag">{shot.reversed ? "已倒放" : "正向"}</span>
        <button className="rs-btn ghost" disabled={busy || !prev} onClick={() => void mergeUp()}>
          合并到上一镜头
        </button>
        <button className="rs-btn ghost" disabled={busy} onClick={() => void splitMid()}>
          从中点拆分
        </button>
        <button className="rs-btn ghost" disabled={busy} onClick={() => void toggleReverse()}>
          {shot.reversed ? "取消倒放" : "倒放"}
        </button>
        <button className="rs-btn ghost" disabled={busy || !source || source.kind !== "video"} onClick={() => void rekeyframe()}>
          重新抽帧
        </button>
      </header>
      <div
        ref={trackRef}
        className="rs-cut-track"
        onPointerMove={(event) => onMoveBoundary(event.clientX)}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        {project.shots.map((s) => {
          const leftPct = (s.startSec / total) * 100;
          const widthPct = (s.durationSec / total) * 100;
          const isCurrent = s.id === shot.id;
          return (
            <div
              key={s.id}
              className={`rs-cut-segment${s.reversed ? " reverse" : ""}${isCurrent ? "" : ""}`}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              onClick={() => onSelectShot(s.id)}
              title={`${s.label} ${formatPrecise(s.startSec)} → ${formatPrecise(s.endSec)}`}
            />
          );
        })}
        {isSegmentEditable(project, shot, prev, next) && (
          <>
            <span
              className="rs-cut-handle left"
              onPointerDown={(event) => {
                event.stopPropagation();
                drag.current = { side: "left", startClientX: event.clientX, startSec: shot.startSec };
                event.currentTarget.parentElement?.setPointerCapture(event.pointerId);
              }}
            />
            <span
              className="rs-cut-handle right"
              onPointerDown={(event) => {
                event.stopPropagation();
                drag.current = { side: "right", startClientX: event.clientX, startSec: shot.endSec };
                event.currentTarget.parentElement?.setPointerCapture(event.pointerId);
              }}
            />
          </>
        )}
      </div>
      <p className="rs-muted" style={{ fontSize: 11, marginTop: 6 }}>
        拖动黄色边界调整当前镜头切口；修改后建议点击「重新抽帧」更新关键帧。倒放会在素材化/合成时生效。
      </p>
      {message && <p style={{ color: "#ff9c9c", fontSize: 12 }}>{message}</p>}
    </section>
  );
}

function isSegmentEditable(
  project: RsProject,
  shot: RsShot,
  prev: RsShot | null,
  next: RsShot | null,
): boolean {
  const index = project.shots.findIndex((s) => s.id === shot.id);
  return index >= 0 && Boolean(prev || next || shot.durationSec > 0.6);
}
