// CDP driver: 替换工作室 编辑流程验证(新建项目 → 步骤导航 → 素材面板)。
import WebSocket from "ws";

const CDP_PORT = 9223;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  // 先通过 YUH 侧边栏按钮打开替换工作室(若未打开)
  const yuhTarget = targets.find((x) => x.type === "page" && x.url.includes("dev-src/renderer"));
  if (yuhTarget) {
    const won = new WebSocket(yuhTarget.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      won.on("open", res);
      won.on("error", rej);
    });
    let wid = 0;
    const wpending = new Map();
    won.on("message", (d) => {
      const m = JSON.parse(d.toString());
      if (m.id && wpending.has(m.id)) {
        wpending.get(m.id)(m);
        wpending.delete(m.id);
      }
    });
    const wsend = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const i = ++wid;
        wpending.set(i, (m) =>
          m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result),
        );
        won.send(JSON.stringify({ id: i, method, params }));
      });
    await wsend("Runtime.evaluate", {
      expression: `(() => {
        const b = document.querySelector('aside.left-rail nav .yuh-replacement-entry');
        if (b) b.click();
        return Boolean(b);
      })()`,
      returnByValue: true,
    });
    won.close();
  }
  await sleep(2500);

  const targets2 = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  const t = targets2.find((x) => x.type === "page" && /serpentHosted/.test(x.url));
  if (!t) throw new Error("no serpent target");
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.on("open", res);
    ws.on("error", rej);
  });
  let id = 0;
  const pending = new Map();
  ws.on("message", (d) => {
    const m = JSON.parse(d.toString());
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      pending.set(i, (m) =>
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result),
      );
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error("eval: " + JSON.stringify(r.exceptionDetails).slice(0, 800));
    return r.result?.value;
  };
  await send("Runtime.enable");
  await send("Page.enable");

  // 打开替换工作室
  await evaluate(`(async () => {
    const root = document.querySelector('.rs-root');
    if (root) return 'already open';
    return 'closed';
  })()`);
  // 若未打开,通过 window.dispatchEvent 模拟?直接走 host 事件不好模拟 —— 先检查
  const opened = await evaluate(`(async () => {
    let root = document.querySelector('.rs-root');
    if (!root) return 'need-open';
    return 'open';
  })()`);
  if (opened !== "open") {
    console.log("studio not open, aborting (run cdp-replacement-studio.mjs first)");
    process.exit(2);
  }

  // 1) 新建项目
  const clicked = await evaluate(`(async () => {
    const card = document.querySelector('.rs-new-card');
    if (!card) return 'no-card';
    card.click();
    await new Promise(r => setTimeout(r, 200));
    const input = document.querySelector('.rs-modal input');
    if (!input) return 'no-modal-input';
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(input, 'E2E 测试项目');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 100));
    const create = Array.from(document.querySelectorAll('.rs-modal .rs-btn')).find(b => /创建/.test(b.textContent));
    if (!create) return 'no-create-btn';
    create.click();
    await new Promise(r => setTimeout(r, 900));
    return {
      steps: Array.from(document.querySelectorAll('.rs-step')).map(s => s.textContent.trim()),
      activeStep: document.querySelector('.rs-step.active')?.textContent.trim() || '',
      title: document.querySelector('.rs-topbar .rs-subtitle')?.textContent || '',
      hasBasePanel: Boolean(document.querySelector('.rs-panel heading, .rs-panel h3')),
      panels: Array.from(document.querySelectorAll('.rs-panel h3')).map(h => h.textContent.trim().slice(0, 20)),
    };
  })()`);
  console.log("create:", JSON.stringify(clicked));

  // 2) 视图切换:首页 → 编辑器;再截图
  await sleep(500);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const { writeFileSync } = await import("node:fs");
  writeFileSync("scripts/replacement-studio-editor-shot.png", Buffer.from(shot.data, "base64"));
  console.log("saved editor shot");

  // 3) 任务状态: rs 项目保存后能重新读到
  const reload = await evaluate(`(async () => {
    const projects = await window.serpent.host.projectsLoad();
    return (projects?.projects || []).map(p => ({ title: p.title, id: p.id }));
  })()`);
  console.log("projects after create:", JSON.stringify(reload));

  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e && e.stack ? e.stack : e);
  process.exit(1);
});
