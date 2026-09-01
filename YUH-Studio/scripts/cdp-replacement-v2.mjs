// CDP driver: 替换工作室 v2 功能验证
// 1) 侧栏入口 → 替换工作室打开;2) 新建项目(步骤导航 5 步 + gate);
// 3) 素材设定四栏布局;4) 检查端口/预览组件挂载。
import WebSocket from "ws";

const CDP_PORT = 9223;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const waitTarget = async (match, timeout = 120000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      try {
        const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
        const t = targets.find(match);
        if (t) return t;
      } catch {}
      await sleep(500);
    }
    throw new Error("target timeout");
  };

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

  // 1) 打开替换工作室(经 YUH 侧栏按钮)
  const yuhTarget = await waitTarget((t) => t.type === "page" && t.url.includes("dev-src/renderer"));
  const yuh = await connect(yuhTarget.webSocketDebuggerUrl);
  await yuh.send("Runtime.enable");
  await yuh.send("Page.enable");
  // 按钮出现检查 + 点击由 evaluate 完成
  const clickResult = await yuh.evaluate(`(async () => {
    for (let i = 0; i < 40; i++) {
      const b = document.querySelector('aside.left-rail nav .yuh-replacement-entry');
      if (b) { b.click(); return 'clicked'; }
      await new Promise(r => setTimeout(r, 250));
    }
    return 'missing';
  })()`);
  console.log("[sidebar] click:", clickResult);
  await sleep(3000);

  // 2) Serpent 视图检查 v2 首页
  const serpTarget = await waitTarget((t) => t.type === "page" && /serpentHosted/.test(t.url), 90000);
  const serp = await connect(serpTarget.webSocketDebuggerUrl);
  await serp.send("Runtime.enable");
  await serp.send("Page.enable");

  const home = await serp.evaluate(`(async () => {
    for (let i = 0; i < 40; i++) {
      const root = document.querySelector('.rs-root');
      if (root) break;
      await new Promise(r => setTimeout(r, 250));
    }
    const root = document.querySelector('.rs-root');
    if (!root) return { mounted: false };
    return {
      mounted: true,
      title: root.querySelector('.rs-title')?.textContent || '',
      hasNewCard: Boolean(root.querySelector('.rs-new-card')),
      homeText: root.textContent.includes('智能裁剪'),
    };
  })()`);
  console.log("[v2] home:", JSON.stringify(home));

  // 3) 新建项目 → 步骤导航 + 素材设定四栏
  const editor = await serp.evaluate(`(async () => {
    const card = document.querySelector('.rs-new-card');
    if (!card) return { created: false };
    card.click();
    await new Promise(r => setTimeout(r, 200));
    const input = document.querySelector('.rs-modal input');
    if (!input) return { created: false, why: 'no modal input' };
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(input, 'V2 流程验证');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 100));
    const create = Array.from(document.querySelectorAll('.rs-modal .rs-btn')).find(b => /创建/.test(b.textContent));
    create && create.click();
    await new Promise(r => setTimeout(r, 1000));
    const steps = Array.from(document.querySelectorAll('.rs-steps.v2 .rs-step')).map(s => ({
      text: s.textContent.trim(),
      active: s.classList.contains('active'),
      locked: s.classList.contains('locked'),
    }));
    return {
      created: true,
      steps,
      materialPanels: Array.from(document.querySelectorAll('.rs-panel h3')).map(h => (h.textContent || '').trim().slice(0, 16)),
      footerTitle: document.querySelector('.rs-step-footer .rs-guidance strong')?.textContent || '',
      hasFourPanel: Boolean(document.querySelector('.rs-four-panel')),
      hasRailTabs: Boolean(document.querySelector('.rs-rail-tabs')),
      sourceButtons: Array.from(document.querySelectorAll('.rs-empty .rs-btn')).map(b => b.textContent.trim()),
    };
  })()`);
  console.log("[v2] editor:", JSON.stringify(editor, null, 1));

  // 4) 截图
  try {
    const shot = await serp.send("Page.captureScreenshot", { format: "png" });
    const { writeFileSync } = await import("node:fs");
    writeFileSync("scripts/replacement-studio-v2-shot.png", Buffer.from(shot.data, "base64"));
    console.log("[shot] saved");
  } catch (e) {
    console.log("[shot] failed:", e.message);
  }

  serp.ws.close();
  yuh.ws.close();
  console.log("V2 E2E DONE");
  process.exit(0);
}

main().catch((error) => {
  console.error("V2 E2E FAILED:", error && error.stack ? error.stack : error);
  process.exit(1);
});
