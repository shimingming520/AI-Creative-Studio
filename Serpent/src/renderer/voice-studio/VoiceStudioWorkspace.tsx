/**
 * 语音工作室 — 字幕识别 → 翻译 → 配音 → 合成(对齐 ShuoCanvas 语音工作室)。
 *
 *   1) 素材:音频直接转写;视频先抽音(ffmpeg);
 *   2) 字幕识别:whisper verbose_json 分段(无分段时按文本估算兜底);
 *   3) 翻译:整表共享上下文的批量翻译,按分段 id 回填;
 *   4) 配音:每段可选 保留原声/音色克隆(IndexTTS)/音色设计(TTS),批量生成;
 *   5) 合成:保留原声或全部替换,按分段时间轴 amix + adelay 拼接导出。
 *
 * 草稿存 localStorage(vs:draft:v1);引擎复用 YUH 既有 TTS/IndexTTS/whisper。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildTimeline,
  buildTranslationSystemPrompt,
  buildTranslationUserPrompt,
  dubPlan,
  formatMs,
  parseTranslationResult,
  segmentsFromWhisper,
  splitTextToSegments,
  type VoiceDraft,
  type VoiceSegment,
} from "../../shared/voice-studio";
import {
  ensureVsHostApi,
  type VsEngineStatus,
  type VsHostApi,
  type VsProviderInfo,
} from "./host";
import { errorText } from "../replacement-studio/host";
import "./voice-studio.css";

const DRAFT_KEY = "vs:draft:v1";

const LANGUAGES = [
  { id: "zh", label: "中文" },
  { id: "en", label: "英文" },
  { id: "ja", label: "日语" },
  { id: "ko", label: "韩语" },
  { id: "auto", label: "自动" },
];

const TARGET_LANGS = [
  { id: "zh", label: "中文" },
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
  { id: "ko", label: "한국어" },
  { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" },
  { id: "es", label: "Español" },
];

const DEFAULT_DRAFT: VoiceDraft = {
  sourcePath: "",
  sourceName: "",
  providerId: "",
  model: "whisper-1",
  language: "zh",
  targetLang: "en",
  segments: [],
  mixMode: "keep-original",
  gapMs: 120,
};

function loadDraft(): VoiceDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return DEFAULT_DRAFT;
    const parsed = JSON.parse(raw) as Partial<VoiceDraft>;
    return {
      ...DEFAULT_DRAFT,
      ...parsed,
      providerId: parsed.providerId ?? "",
      sourcePath: parsed.sourcePath ?? "",
      sourceName: parsed.sourceName ?? "",
      segments: Array.isArray(parsed.segments) ? parsed.segments : [],
    };
  } catch {
    return DEFAULT_DRAFT;
  }
}

export function VoiceStudioWorkspace({ onExit }: { onExit: () => void }) {
  const [draft, setDraft] = useState<VoiceDraft>(loadDraft);
  const [providers, setProviders] = useState<VsProviderInfo[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [engines, setEngines] = useState<VsEngineStatus | null>(null);
  const [hostReady, setHostReady] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ outputPath: string; durationMs: number } | null>(null);
  const [resultPreview, setResultPreview] = useState("");
  const [muxVideoPath, setMuxVideoPath] = useState("");
  const [muxResult, setMuxResult] = useState<{ outputPath: string } | null>(null);
  const hostRef = useRef<VsHostApi | null>(null);
  const draftTimer = useRef<number | null>(null);

  // 宿主初始化。
  useEffect(() => {
    let cancelled = false;
    ensureVsHostApi()
      .then((host) => {
        hostRef.current = host;
        setHostReady(true);
        return Promise.all([host.listProviders(), host.engines()]);
      })
      .then(([list, engineStatus]) => {
        if (cancelled) return;
        setEngines(engineStatus ?? null);
        const enabled = (Array.isArray(list) ? list : []).filter(
          (provider) => provider.enabled && provider.hasApiKey,
        );
        setProviders(enabled);
        setDraft((prev) => ({
          ...prev,
          providerId: prev.providerId || enabled[0]?.id || "",
        }));
      })
      .catch((reason) => {
        if (!cancelled) setError(errorText(reason));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 草稿持久化。
  const persistDraft = useCallback((next: VoiceDraft) => {
    if (draftTimer.current !== null) window.clearTimeout(draftTimer.current);
    draftTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        // 忽略配额错误
      }
    }, 300);
  }, []);

  const patchDraft = useCallback(
    (patch: Partial<VoiceDraft>) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        persistDraft(next);
        return next;
      });
    },
    [persistDraft],
  );

  // 切换中转站刷新模型。
  useEffect(() => {
    let cancelled = false;
    const providerId = draft.providerId;
    const load = providerId
      ? hostRef.current?.listModels(providerId) ?? Promise.resolve({ models: [] })
      : Promise.resolve({ models: [] });
    load
      .then((result) => {
        if (cancelled) return;
        const list = Array.isArray(result?.models) ? result.models : [];
        setModels(list);
        setDraft((prev) => ({
          ...prev,
          model:
            prev.model && list.includes(prev.model) ? prev.model : list[0] || "whisper-1",
        }));
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      });
    return () => {
      cancelled = true;
    };
  }, [draft.providerId]);

  const patchSegment = useCallback(
    (id: string, patch: Partial<VoiceSegment>) => {
      setDraft((prev) => ({
        ...prev,
        segments: prev.segments.map((segment) =>
          segment.id === id ? { ...segment, ...patch } : segment,
        ),
      }));
    },
    [],
  );

  // ---- 素材 ----
  const pickAudio = useCallback(async () => {
    try {
      const picked = await hostRef.current?.pickFiles();
      const file = picked?.find((item) => /\.(mp3|wav|m4a|flac|ogg|aac|opus|wma)$/i.test(item.path));
      if (file) {
        patchDraft({ sourcePath: file.path, sourceName: file.name, segments: [] });
        setResult(null);
        setResultPreview("");
      } else {
        setError("未选择音频文件(支持 mp3/wav/m4a/flac 等)");
      }
    } catch (reason) {
      setError(errorText(reason));
    }
  }, [patchDraft]);

  const pickVideo = useCallback(async () => {
    try {
      const picked = await hostRef.current?.pickVideo();
      const file = picked?.[0];
      if (!file) return;
      setBusy("正在抽取音频…");
      try {
        const extracted = await hostRef.current?.extractAudio({ file: file.path });
        if (extracted?.path) {
          patchDraft({ sourcePath: extracted.path, sourceName: `${file.name} → audio.wav`, segments: [] });
          setResult(null);
          setResultPreview("");
        }
      } finally {
        setBusy("");
      }
    } catch (reason) {
      setError(errorText(reason));
    }
  }, [patchDraft]);

  // ---- 步骤1:字幕识别 ----
  const transcribing = useRef(false);
  const runTranscribe = useCallback(async () => {
    const host = hostRef.current;
    if (!host || !draft.sourcePath || transcribing.current) return;
    transcribing.current = true;
    setBusy("正在识别字幕…");
    setError("");
    try {
      const result2 = await host.transcribe({
        file: draft.sourcePath,
        providerId: draft.providerId,
        model: draft.model,
        language: draft.language === "auto" ? "" : draft.language,
      });
      let segments = segmentsFromWhisper(result2?.segments);
      if (segments.length === 0) {
        const estimateMs = Array.from(result2?.text || "").length * 250 + 5000;
        segments = splitTextToSegments(result2?.text || "", estimateMs);
      }
      if (segments.length === 0) throw new Error("未识别到字幕内容");
      patchDraft({ segments });
      setBusy("");
    } catch (reason) {
      setError(errorText(reason));
      setBusy("");
    } finally {
      transcribing.current = false;
    }
  }, [draft.sourcePath, draft.providerId, draft.model, draft.language, patchDraft]);

  // ---- 步骤2:翻译 ----
  const runTranslate = useCallback(async () => {
    const host = hostRef.current;
    if (!host || draft.segments.length === 0) return;
    setBusy("正在翻译…");
    setError("");
    try {
      const result2 = await host.translate({
        providerId: draft.providerId,
        model: draft.model,
        system: buildTranslationSystemPrompt(),
        user: buildTranslationUserPrompt(draft.segments, draft.targetLang),
      });
      const byId = parseTranslationResult(result2.text);
      if (!byId) throw new Error("无法解析翻译结果,请重试或更换模型");
      setDraft((prev) => ({
        ...prev,
        segments: prev.segments.map((segment) => ({
          ...segment,
          translatedText: byId[segment.id] ?? segment.translatedText,
        })),
      }));
      setBusy("");
    } catch (reason) {
      setError(errorText(reason));
      setBusy("");
    }
  }, [draft.segments, draft.providerId, draft.model, draft.targetLang]);

  const clearTranslation = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      segments: prev.segments.map((segment) => ({ ...segment, translatedText: "" })),
    }));
    setBusy("");
  }, []);

  // ---- 步骤3:配音 ----
  const [dubbing, setDubbing] = useState(false);
  const runDub = useCallback(async () => {
    const host = hostRef.current;
    const plan = dubPlan(draft.segments);
    if (!host || plan.length === 0 || dubbing) return;
    setDubbing(true);
    setError("");
    try {
      for (const segment of plan) {
        const text = segment.translatedText || segment.text;
        patchSegment(segment.id, { dubStatus: "running", dubError: null });
        try {
          const result2 =
            segment.voiceMode === "clone"
              ? await host.cloneVoice({
                  text,
                  refAudioPath: segment.refAudioPath || "",
                  lang: draft.language === "auto" ? "zh" : draft.language,
                })
              : await host.designVoice({
                  text,
                  design: segment.designText || "自然的旁白声音",
                  lang: draft.language === "auto" ? "zh" : draft.language,
                });
          patchSegment(segment.id, {
            dubStatus: "done",
            audioPath: result2.outputPath,
          });
          host
            .readFile(result2.outputPath)
            .then((dataUrl) =>
              setPreviews((prev) => ({ ...prev, [segment.id]: dataUrl })),
            )
            .catch(() => {});
        } catch (reason) {
          patchSegment(segment.id, {
            dubStatus: "error",
            dubError: errorText(reason),
          });
        }
      }
      setBusy("");
    } finally {
      setDubbing(false);
    }
  }, [draft.segments, draft.language, dubbing, patchSegment]);

  // ---- 步骤4:合成 ----
  const timeline = useMemo(
    () =>
      buildTimeline(draft.segments, {
        mixMode: draft.mixMode,
        gapMs: draft.gapMs,
        totalMs: Math.max(
          ...draft.segments.map((segment) => segment.endMs),
          5000,
        ),
      }),
    [draft.segments, draft.mixMode, draft.gapMs],
  );

  const composing = useRef(false);
  const runCompose = useCallback(async () => {
    const host = hostRef.current;
    if (!host || timeline.length === 0 || composing.current) return;
    composing.current = true;
    setBusy("正在合成音频…");
    setError("");
    try {
      const maxEnd = Math.max(...draft.segments.map((segment) => segment.endMs), 1000);
      const dubbedSegments = draft.segments
        .filter((segment) => segment.audioPath)
        .map((segment) => ({
          id: segment.id,
          startMs: segment.startMs,
          endMs: segment.endMs,
          audioPath: segment.audioPath!,
        }));
      const result2 = await host.concatAudio({
        segments: dubbedSegments,
        basePath: draft.mixMode === "keep-original" ? draft.sourcePath : null,
        mixMode: draft.mixMode,
        totalMs: maxEnd + draft.gapMs,
      });
      setResult(result2);
      host
        .readFile(result2.outputPath)
        .then((dataUrl) => setResultPreview(dataUrl))
        .catch(() => setResultPreview(""));
      setBusy(`已导出:${result2.outputPath}`);
    } catch (reason) {
      setError(errorText(reason));
      setBusy("");
    } finally {
      composing.current = false;
    }
  }, [draft.segments, draft.mixMode, draft.sourcePath, draft.gapMs, timeline.length]);

  const pickRefAudio = useCallback(
    async (id: string) => {
      try {
        const picked = await hostRef.current?.pickFiles();
        const file = picked?.find((item) => /\.(mp3|wav|m4a|flac|ogg|aac|wma)$/i.test(item.path));
        if (file) patchSegment(id, { refAudioPath: file.path });
      } catch (reason) {
        setError(errorText(reason));
      }
    },
    [patchSegment],
  );

  const openResult = useCallback(async () => {
    if (!result) return;
    try {
      await hostRef.current?.showItem(result.outputPath);
    } catch (reason) {
      setError(errorText(reason));
    }
  }, [result]);

  // 成片:读入替换工作室分享的成片视频(若已设置),供 mux。
  useEffect(() => {
    const incoming = localStorage.getItem("vs:incoming-video");
    if (incoming) setMuxVideoPath(incoming);
  }, []);

  const pickMuxVideo = useCallback(async () => {
    try {
      const picked = await hostRef.current?.pickVideo();
      const file = picked?.[0];
      if (file) {
        setMuxVideoPath(file.path);
        try {
          localStorage.setItem("vs:incoming-video", file.path);
        } catch {
          // 忽略配额
        }
      }
    } catch (reason) {
      setError(errorText(reason));
    }
  }, []);

  const muxing = useRef(false);
  const runMux = useCallback(async () => {
    const host = hostRef.current;
    if (!host || !result?.outputPath || !muxVideoPath || muxing.current) return;
    muxing.current = true;
    setBusy("正在合成成片…");
    setError("");
    try {
      const out = await host.muxVideo({
        videoPath: muxVideoPath,
        audioPath: result.outputPath,
        syncToVideo: true,
      });
      setMuxResult(out);
      setBusy(`成片已导出:${out.outputPath}`);
    } catch (reason) {
      setError(errorText(reason));
      setBusy("");
    } finally {
      muxing.current = false;
    }
  }, [result, muxVideoPath]);

  const openMuxResult = useCallback(async () => {
    if (!muxResult) return;
    try {
      await hostRef.current?.showItem(muxResult.outputPath);
    } catch (reason) {
      setError(errorText(reason));
    }
  }, [muxResult]);

  const ttsReady = engines?.tts?.state === "ready";
  const indexttsReady = engines?.indextts?.state === "ready";

  return (
    <div className="vs-workspace" role="dialog" aria-label="语音工作室">
      <header className="vs-header">
        <div className="vs-title">
          <h1>语音工作室</h1>
          <span className="vs-subtitle">字幕识别 → 翻译 → 配音(音色克隆/设计) → 合成</span>
        </div>
        <div className="vs-actions">
          <button type="button" className="vs-btn vs-btn-quiet" onClick={onExit}>
            返回资源库
          </button>
        </div>
      </header>

      <section className="vs-source">
        <div className="vs-source-actions">
          <button type="button" className="vs-btn" onClick={() => void pickAudio()}>
            选择音频
          </button>
          <button type="button" className="vs-btn" onClick={() => void pickVideo()}>
            选择视频(自动抽音)
          </button>
          {draft.sourceName && <span className="vs-source-name">{draft.sourceName}</span>}
        </div>
        {!hostReady && <span className="vs-hint">正在连接宿主…</span>}
        {busy && <span className="vs-busy">{busy}</span>}
        {error && <span className="vs-error">{error}</span>}
      </section>

      <section className="vs-panel">
        <h2>① 字幕识别</h2>
        <div className="vs-row">
          <label>
            中转站
            <select
              value={draft.providerId}
              onChange={(event) => patchDraft({ providerId: event.target.value })}
            >
              {providers.length === 0 && <option value="">(无可用的中转站)</option>}
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            转写模型
            <select
              value={draft.model}
              onChange={(event) => patchDraft({ model: event.target.value })}
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
          <label>
            语言
            <select
              value={draft.language}
              onChange={(event) => patchDraft({ language: event.target.value })}
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="vs-btn vs-btn-primary"
            onClick={() => void runTranscribe()}
            disabled={!draft.sourcePath || !draft.providerId}
          >
            开始识别
          </button>
        </div>
        {draft.segments.length > 0 && (
          <div className="vs-hint">共 {draft.segments.length} 段 · 文本可直接编辑</div>
        )}
      </section>

      {draft.segments.length > 0 && (
        <section className="vs-panel">
          <h2>② 翻译</h2>
          <div className="vs-row">
            <label>
              目标语言
              <select
                value={draft.targetLang}
                onChange={(event) => patchDraft({ targetLang: event.target.value })}
              >
                {TARGET_LANGS.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="vs-btn vs-btn-primary"
              onClick={() => void runTranslate()}
              disabled={draft.segments.length === 0}
            >
              开始翻译
            </button>
            <button type="button" className="vs-btn" onClick={clearTranslation}>
              清除翻译
            </button>
          </div>
        </section>
      )}

      {draft.segments.length > 0 && (
        <section className="vs-panel">
          <h2>③ 配音</h2>
          <div className="vs-row">
            <span className="vs-hint">
              引擎:IndexTTS {indexttsReady ? "✓ 就绪" : "✗ 未就绪"} · TTS 音色设计{" "}
              {ttsReady ? "✓ 就绪" : "✗ 未就绪"}
            </span>
            <button
              type="button"
              className="vs-btn vs-btn-primary"
              onClick={() => void runDub()}
              disabled={dubbing || draft.segments.length === 0 || !indexttsReady}
            >
              {dubbing ? "配音中…" : "全部生成配音"}
            </button>
          </div>
          <div className="vs-segments">
            {draft.segments.map((segment) => (
              <div className="vs-segment" key={segment.id}>
                <div className="vs-segment-head">
                  <span className="vs-segment-time">
                    {formatMs(segment.startMs)} → {formatMs(segment.endMs)}
                  </span>
                  <select
                    value={segment.voiceMode}
                    onChange={(event) =>
                      patchSegment(segment.id, {
                        voiceMode: event.target.value as VoiceSegment["voiceMode"],
                        dubStatus: "idle",
                        dubError: null,
                        audioPath: null,
                      })
                    }
                  >
                    <option value="none">保留原声</option>
                    <option value="clone">音色克隆(IndexTTS)</option>
                    <option value="design">音色设计(TTS)</option>
                  </select>
                  {segment.voiceMode === "clone" && (
                    <button
                      type="button"
                      className="vs-btn vs-btn-quiet"
                      onClick={() => void pickRefAudio(segment.id)}
                    >
                      {segment.refAudioPath ? "已选参考" : "选择参考音频"}
                    </button>
                  )}
                </div>
                <textarea
                  className="vs-text"
                  value={segment.translatedText || segment.text}
                  onChange={(event) =>
                    patchSegment(segment.id, { translatedText: event.target.value })
                  }
                  title="配音文本(有译文用译文,否则用原文)"
                />
                {segment.voiceMode === "design" && (
                  <input
                    className="vs-design"
                    value={segment.designText}
                    placeholder="音色描述,如:温柔女声,语速稍慢"
                    onChange={(event) =>
                      patchSegment(segment.id, { designText: event.target.value })
                    }
                  />
                )}
                <div className="vs-segment-foot">
                  {segment.dubStatus === "running" && <span className="vs-busy">生成中…</span>}
                  {segment.dubStatus === "error" && (
                    <span className="vs-error">{segment.dubError}</span>
                  )}
                  {segment.dubStatus === "done" && (
                    <span className="vs-ok">已生成</span>
                  )}
                  {previews[segment.id] && (
                    <audio controls src={previews[segment.id]} preload="none" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {draft.segments.length > 0 && (
        <section className="vs-panel">
          <h2>④ 合成</h2>
          <div className="vs-row">
            <label>
              模式
              <select
                value={draft.mixMode}
                onChange={(event) =>
                  patchDraft({ mixMode: event.target.value as VoiceDraft["mixMode"] })
                }
              >
                <option value="keep-original">保留原声(配音覆盖)</option>
                <option value="dub-all">全部替换(去原声)</option>
              </select>
            </label>
            <label>
              段间静音(ms)
              <input
                type="number"
                min={0}
                max={2000}
                value={draft.gapMs}
                onChange={(event) => patchDraft({ gapMs: Number(event.target.value) || 0 })}
              />
            </label>
            <button
              type="button"
              className="vs-btn vs-btn-primary"
              onClick={() => void runCompose()}
              disabled={timeline.length === 0}
            >
              开始合成
            </button>
          </div>
          {timeline.length > 0 && (
            <div className="vs-timeline">
              {timeline.map((slot, index) => (
                <div
                  key={index}
                  className={`vs-timeline-slot vs-timeline-${slot.kind}`}
                  style={{
                    left: `${(slot.offsetMs / Math.max(timeline[timeline.length - 1]!.offsetMs + timeline[timeline.length - 1]!.durationMs, 1)) * 100}%`,
                    width: `${(slot.durationMs / Math.max(timeline[timeline.length - 1]!.offsetMs + timeline[timeline.length - 1]!.durationMs, 1)) * 100}%`,
                  }}
                  title={`${slot.kind} @${formatMs(slot.offsetMs)} +${slot.durationMs}ms`}
                />
              ))}
            </div>
          )}
          {result && (
            <div className="vs-result">
              <span className="vs-ok">已合成:{result.outputPath}</span>
              <button type="button" className="vs-btn" onClick={() => void openResult()}>
                打开所在文件夹
              </button>
              {resultPreview && (
                <audio controls src={resultPreview} preload="none" />
              )}
            </div>
          )}
          {result && (
            <div className="vs-panel vs-mux">
              <div className="vs-row">
                <span className="vs-hint">成片导出:替换工作室视频 × 本段音轨 → 最终 mp4</span>
                <button type="button" className="vs-btn" onClick={() => void pickMuxVideo()}>
                  {muxVideoPath ? "已选视频" : "选择成片视频"}
                </button>
                {muxVideoPath && <span className="vs-source-name">{muxVideoPath}</span>}
                <button
                  type="button"
                  className="vs-btn vs-btn-primary"
                  onClick={() => void runMux()}
                  disabled={!muxVideoPath}
                >
                  {muxing.current ? "合片中…" : "合成成片"}
                </button>
              </div>
              {muxResult && (
                <div className="vs-result">
                  <span className="vs-ok">成片:{muxResult.outputPath}</span>
                  <button type="button" className="vs-btn" onClick={() => void openMuxResult()}>
                    打开所在文件夹
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
