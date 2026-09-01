// UI 驱动验证:注入源视频 → 打开项目 → 点击「开始处理(智能裁剪)」→
// 验证镜头数、关键帧、检测跳过提示(无 API Key 时)。
import WebSocket from "ws";

const CDP_PORT = 9223;
const VIDEO = "C:/Users/shi/AppData/Local/Temp/rs-e2e/test-video.mp4";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  const yuhTarget = targets.find((x) => x.type === "page" && x.url.includes("dev-src/renderer"));
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

  // 1) 打开替换工作室
  let yuh = await connect(yuhTarget.webSocketDebuggerUrl);
  await yuh.send("Runtime.enable");
  await yuh.evaluate(`(async () => {
    for (let i = 0; i < 40; i++) {
      const b = document.querySelector('aside.left-rail nav .yuh-replacement-entry');
      if (b) { b.click(); return 'clicked'; }
      await new Promise(r => setTimeout(r, 250));
    }
    return 'missing';
  })()`);
  await sleep(2500);

  let serpT = null;
  for (let i = 0; i < 60; i++) {
    const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
    serpT = list.find((x) => x.type === "page" && /serpentHosted/.test(x.url));
    if (serpT) break;
    await sleep(1000);
  }
  if (!serpT) throw new Error("serpent target not found");
  const serp = await connect(serpT.webSocketDebuggerUrl);
  await serp.send("Runtime.enable");
  await serp.send("Page.enable");

  // 2) 注入一个带源视频的项目(绕过原生文件选择)
  const seeded = await serp.evaluate(`(async () => {
    const host = window.serpent.host;
    const projects = await host.projectsLoad();
    let p = (projects.projects || []).find(x => x.title === 'UI 流验证');
    if (!p) {
      p = {
        version: 2, id: 'ui-flow-' + Date.now().toString(36), title: 'UI 流验证',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        step: 'material', sources: [], shots: [], sourceCharacters: [], characters: [],
        scenes: [], audios: [], settings: {}, history: [],
        compose: { finalVideoPath: null, finalAudioPath: null, status: 'idle', error: null, composedShotIds: [] },
      };
    }
    p.sources = [{ id: 'src-1', path: ${JSON.stringify(VIDEO)}, name: 'test-video.mp4', kind: 'video', durationSec: 9.02, width: 640, height: 360, keyframePath: null, analysisStatus: 'idle', analysisError: null }];
    p.shots = [];
    await host.projectSave(p);
    return p.id;
  })()`);
  console.log("[seed] project:", seeded);

  // 3) 重载 Serpent 页面(重新加载项目列表),再经 YUH 按钮重新打开
  await serp.send("Page.reload", { ignoreCache: false });
  await sleep(5000);
  await yuh.evaluate(`(async () => {
    const b = document.querySelector('aside.left-rail nav .yuh-replacement-entry');
    if (b) b.click();
    return Boolean(b);
  })()`);
  await sleep(3000);
  const opened = await serp.evaluate(`(async () => {
    for (let i = 0; i < 30; i++) {
      const card = Array.from(document.querySelectorAll('.rs-project-card')).find(c => /UI 流验证/.test(c.textContent));
      if (card) { card.click(); await new Promise(r => setTimeout(r, 900)); return 'opened'; }
      await new Promise(r => setTimeout(r, 300));
    }
    return 'card-missing';
  })()`);
  console.log("[open]", opened);

  // 4) 点击「开始处理(智能裁剪)」并轮询结果
  const analysis = await serp.evaluate(`(async () => {
    const btn = Array.from(document.querySelectorAll('.rs-btn')).find(b => /开始处理/.test(b.textContent));
    if (!btn) return { clicked: false };
    btn.click();
    for (let i = 0; i < 90; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const txt = document.querySelector('.rs-body') ? document.body.textContent : '';
      const shots = Array.from(document.querySelectorAll('.rs-shot-card')).length;
      const logLines = Array.from(document.querySelectorAll('.rs-log div')).map(d => d.textContent);
      const done = logLines.some(l => /分析完成|跳过人物检测/.test(l));
      if (done) {
        return { clicked: true, shots, done, log: logLines.slice(-4) };
      }
      if (i > 20 && /失败/.test(txt) && logLines.some(l => /失败/.test(l))) {
        return { clicked: true, error: logLines.slice(-4) };
      }
    }
    return { clicked: true, timeout: true };
  })()`);
  console.log("[analysis]", JSON.stringify(analysis, null, 1));

  serp.ws.close();
  yuh.ws.close();
  console.log("UI FLOW DONE");
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e && e.stack ? e.stack : e);
  process.exit(1);
});
