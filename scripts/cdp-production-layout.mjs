// 验证「图像替换」生产四栏布局(舞台检测框 + 绑定列表 + 生成面板)。
import WebSocket from "ws";

const CDP_PORT = 9223;
const FRAME = "C:/Users/shi/AppData/Local/Temp/rs-e2e/t2.png";
const VIDEO = "C:/Users/shi/AppData/Local/Temp/rs-e2e/test-video.mp4";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const list = async () => (await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json());
  const yuhTarget = (await list()).find((x) => x.type === "page" && x.url.includes("dev-src/renderer"));
  const connect = (url) =>
    new Promise((resolve, reject) => {
      const ws = new WebSocket(url, { maxPayload: 128 * 1024 * 1024 });
      let id = 0;
      const pending = new Map();
      ws.on("message", (d) => {
        const m = JSON.parse(d.toString());
        if (m.id && pending.has(m.id)) {
          pending.get(m.id)(m);
          pending.delete(m.id);
        }
      });
      ws.on("open", () =>
        resolve({
          ws,
          send(method, params = {}) {
            return new Promise((res, rej) => {
              const i = ++id;
              pending.set(i, (m) =>
                m.error ? rej(new Error(JSON.stringify(m.error).slice(0, 300))) : res(m.result),
              );
              ws.send(JSON.stringify({ id: i, method, params }));
            });
          },
          async evaluate(expression) {
            const r = await this.send("Runtime.evaluate", {
              expression,
              awaitPromise: true,
              returnByValue: true,
            });
            if (r.exceptionDetails) throw new Error("eval: " + JSON.stringify(r.exceptionDetails).slice(0, 900));
            return r.result?.value;
          },
        }),
      );
      ws.on("error", reject);
    });

  const yuh = await connect(yuhTarget.webSocketDebuggerUrl);
  await yuh.send("Runtime.enable");
  await yuh.send("Page.enable");

  // 1) 打开工作室 + 种子项目
  await yuh.evaluate(`(async () => {
    for (let i = 0; i < 40; i++) {
      const b = document.querySelector('aside.left-rail nav .yuh-replacement-entry');
      if (b) { b.click(); return true; }
      await new Promise(r => setTimeout(r, 250));
    }
    return false;
  })()`);
  let serpT = null;
  for (let i = 0; i < 60; i++) {
    serpT = (await list()).find((x) => x.type === "page" && /serpentHosted/.test(x.url));
    if (serpT) break;
    await sleep(1000);
  }
  const serp = await connect(serpT.webSocketDebuggerUrl);
  await serp.send("Runtime.enable");
  await serp.send("Page.enable");

  const seeded = await serp.evaluate(`(async () => {
    const host = window.serpent.host;
    const now = new Date().toISOString();
    const p = {
      version: 2, id: 'prod-' + Date.now().toString(36), title: '生产布局验证',
      createdAt: now, updatedAt: now, step: 'image',
      sources: [{ id: 'src-1', path: ${JSON.stringify(VIDEO)}, name: 'test-video.mp4', kind: 'video', durationSec: 9.02, width: 640, height: 360, keyframePath: null, analysisStatus: 'done', analysisError: null }],
      shots: [{
        id: 'shot-1', index: 1, label: '镜头1', sourceId: 'src-1',
        startSec: 0, endSec: 3.02, durationSec: 3.02, videoPath: null,
        keyframePath: ${JSON.stringify(FRAME)}, keyframeTimeSec: 0.6,
        people: [{ id: 'ps-1', letter: 'A', label: '人物A', bbox: { x: 0.1, y: 0.2, w: 0.35, h: 0.6 }, description: '黑长发女性，红裙', confidence: 0.9, method: 'auto', orientation: 'unknown', sourceCharacterId: 'sc-a' }],
        detectionStatus: 'done', detectionError: null,
        imagePrompt: '', imageResults: [], imageActiveIndex: 0, imageStatus: 'idle', imageError: null, referenceImagePath: null,
        videoPrompt: '', videoResults: [], videoActiveIndex: 0, videoStatus: 'idle', videoError: null,
        reversed: false,
        voiceText: '', voiceAudioPath: null, voiceStatus: 'idle', voiceError: null, selected: true,
      }],
      sourceCharacters: [{ id: 'sc-a', letter: 'A', label: '人物A', personIds: ['ps-1'], description: '黑长发女性，红裙', scope: 'full-person', targetCharacterId: 'char-1', targetAppearanceId: 'appa-1' }],
      characters: [{ id: 'char-1', name: '艾米', role: '', description: '年轻女性', appearances: [{ id: 'appa-1', name: '正脸', imagePath: ${JSON.stringify(FRAME)}, prompt: '金色长发' }], boundLetters: ['A'] }],
      scenes: [], audios: [], settings: { providerId: '', imageModel: 'gpt-image-1', imageSize: 'auto', imageQuality: 'auto' },
      history: [],
      workspace: { selectedShotId: 'shot-1' },
      compose: { finalVideoPath: null, finalAudioPath: null, status: 'idle', error: null, composedShotIds: [] },
    };
    await host.projectSave(p);
    return p.id;
  })()`);
  console.log("[seed]", seeded);

  // 2) 重载 → 打开 → 进入图像替换
  await serp.send("Page.reload", { ignoreCache: false });
  await sleep(5000);
  await yuh.evaluate(`(() => { const b = document.querySelector('aside.left-rail nav .yuh-replacement-entry'); if (b) b.click(); return !!b; })()`);
  await sleep(3000);
  const state = await serp.evaluate(`(async () => {
    for (let i = 0; i < 30; i++) {
      const card = Array.from(document.querySelectorAll('.rs-project-card')).find(c => /生产布局验证/.test(c.textContent));
      if (card) { card.click(); await new Promise(r => setTimeout(r, 900)); break; }
      await new Promise(r => setTimeout(r, 300));
    }
    const next = Array.from(document.querySelectorAll('.rs-step-footer .rs-btn')).find(b => /进入图像替换/.test(b.textContent));
    if (next) next.click();
    await new Promise(r => setTimeout(r, 1000));
    const root = document.querySelector('.rs-root');
    return {
      fourPanel: Boolean(root.querySelector('.rs-four-panel.production')),
      boxes: root.querySelectorAll('.rs-box.v2').length,
      manualBtn: Array.from(root.querySelectorAll('.rs-stage-tools .rs-btn')).some(b => /手动框选/.test(b.textContent)),
      bindingItems: root.querySelectorAll('.rs-binding-item').length,
      genPanel: Boolean(root.querySelector('.rs-generation-panel')),
      timelineCards: root.querySelectorAll('.rs-shot-card').length,
      cutEditor: Boolean(root.querySelector('.rs-cut-editor')),
      activeStep: root.querySelector('.rs-step.active')?.textContent.trim() || '',
      hasPrompt: Boolean(root.querySelector('.rs-generation-copy textarea')),
      hasModel: Boolean(root.querySelectorAll('.rs-generation-copy select').length >= 2),
      saveState: Boolean(root.querySelector('.rs-save-state')),
    };
  })()`);
  console.log("[prod]", JSON.stringify(state));

  const shot = await serp.send("Page.captureScreenshot", { format: "png" });
  const { writeFileSync } = await import("node:fs");
  writeFileSync("scripts/replacement-studio-prod-shot.png", Buffer.from(shot.data, "base64"));
  console.log("[shot] saved");
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e && e.stack ? e.stack : e);
  process.exit(1);
});
