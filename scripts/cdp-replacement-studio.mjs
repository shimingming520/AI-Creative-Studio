// CDP driver: 替换工作室 E2E 验证
// 前提: YUH Studio 以 --remote-debugging-port=9223 启动。
// 验证点:
//   1) legacy 侧边栏出现「资源管理」+「替换工作室」两个注入按钮;
//   2) 点击「替换工作室」→ window.h3.serpent.openView("replacement-studio");
//   3) Serpent 嵌入视图出现 .rs-root(替换工作室 UI)且 window.serpent.host 可用;
//   4) rs 通道往返: projectsLoad() / listProviders()。
import WebSocket from "ws";

const CDP_PORT = 9223;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function listTargets() {
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  return res.json();
}

async function waitFor(predicate, timeoutMs = 60000, step = 500) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const value = await predicate();
      if (value) return value;
    } catch {}
    await sleep(step);
  }
  throw new Error("waitFor timeout");
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, { maxPayload: 128 * 1024 * 1024 });
    let id = 0;
    const pending = new Map();
    ws.on("message", (data) => {
      const m = JSON.parse(data.toString());
      if (m.id && pending.has(m.id)) {
        pending.get(m.id)(m);
        pending.delete(m.id);
      }
    });
    ws.on("open", () =>
      resolve({
        send(method, params = {}) {
          return new Promise((res, rej) => {
            const msgId = ++id;
            pending.set(msgId, (m) =>
              m.error ? rej(new Error(method + ": " + JSON.stringify(m.error).slice(0, 400))) : res(m.result),
            );
            ws.send(JSON.stringify({ id: msgId, method, params }));
          });
        },
        async evaluate(expression) {
          const res = await this.send("Runtime.evaluate", {
            expression,
            awaitPromise: true,
            returnByValue: true,
          });
          if (res.exceptionDetails) {
            throw new Error(
              "eval: " + JSON.stringify(res.exceptionDetails).slice(0, 1200),
            );
          }
          return res.result?.value;
        },
        close() {
          ws.close();
        },
      }),
    );
    ws.on("error", reject);
  });
}

async function main() {
  // 1) 等待 YUH 主页面
  const yuhTarget = await waitFor(async () => {
    const targets = await listTargets();
    return targets.find((t) => t.type === "page" && t.url.includes("dev-src/renderer"));
  }, 120000);
  console.log("[yuh] target:", yuhTarget.url.slice(0, 120));

  const yuh = await connect(yuhTarget.webSocketDebuggerUrl);
  await yuh.send("Runtime.enable");
  await yuh.send("Page.enable");

  // 2) 等侧栏按钮出现
  const buttons = await waitFor(async () => {
    const info = await yuh.evaluate(`(() => {
      const nav = document.querySelector('aside.left-rail nav');
      if (!nav) return null;
      const repl = nav.querySelector('.yuh-replacement-entry');
      const res = nav.querySelector('.yuh-serpent-entry');
      if (!repl || !res) return null;
      return [
        res ? res.textContent.trim() : null,
        repl ? repl.textContent.trim() : null,
      ];
    })()`);
    return Array.isArray(info) ? info : null;
  }, 60000);
  console.log("[sidebar] 资源管理:", buttons[0], "| 替换工作室:", buttons[1]);

  // 3) 点击「替换工作室」按钮(走真实点击 → openView → Serpent 视图)
  const clicked = await yuh.evaluate(`(() => {
    const b = document.querySelector('aside.left-rail nav .yuh-replacement-entry');
    if (!b) return 'missing';
    b.click();
    return 'clicked';
  })()`);
  console.log("[sidebar] click:", clicked);
  await sleep(2500);

  // 4) 找到 Serpent 嵌入视图 target
  const serpentTarget = await waitFor(async () => {
    const targets = await listTargets();
    return targets.find((t) => t.type === "page" && /serpentHosted|main_window/.test(t.url));
  }, 90000);
  console.log("[serpent] target:", serpentTarget.url.slice(0, 160));

  const serpent = await connect(serpentTarget.webSocketDebuggerUrl);
  await serpent.send("Runtime.enable");
  await serpent.send("Page.enable");

  // 5) 替换工作室 UI 挂载 + host 桥可用
  const studio = await waitFor(async () => {
    const info = await serpent.evaluate(`(async () => {
      const root = document.querySelector('.rs-root');
      const hostOk = typeof window.serpent?.host?.isHosted === 'function' && window.serpent.host.isHosted();
      const title = root ? (root.querySelector('.rs-title')?.textContent || '') : '';
      const newCard = root ? Boolean(root.querySelector('.rs-new-card')) : false;
      return { hasRoot: Boolean(root), hostOk, title, newCard };
    })()`);
    return info && info.hasRoot ? info : null;
  }, 60000);
  console.log("[studio] mounted:", JSON.stringify(studio));

  // 6) rs 通道往返
  const ipc = await serpent.evaluate(`(async () => {
    const out = {};
    try {
      const projects = await window.serpent.host.projectsLoad();
      out.projects = Array.isArray(projects?.projects) ? projects.projects.length : 'invalid';
    } catch (e) { out.projects = 'ERR:' + e.message; }
    try {
      const providers = await window.serpent.host.listProviders();
      out.providers = Array.isArray(providers) ? providers.length : 'invalid';
    } catch (e) { out.providers = 'ERR:' + e.message; }
    try {
      const ws = await window.serpent.host.workspace();
      out.workspace = ws ? ws.outputDir : 'null';
    } catch (e) { out.workspace = 'ERR:' + e.message; }
    return out;
  })()`);
  console.log("[ipc] rs round-trip:", JSON.stringify(ipc));

  // 7) 截图
  try {
    const shot = await serpent.send("Page.captureScreenshot", { format: "png" });
    const { writeFileSync } = await import("node:fs");
    writeFileSync("scripts/replacement-studio-shot.png", Buffer.from(shot.data, "base64"));
    console.log("[shot] saved scripts/replacement-studio-shot.png");
  } catch (e) {
    console.log("[shot] failed:", e.message);
  }

  // 8) 返回资源管理 → 关闭叠加层
  const back = await serpent.evaluate(`(async () => {
    const btn = Array.from(document.querySelectorAll('.rs-topbar .rs-btn')).find(b => /返回资源管理/.test(b.textContent));
    if (!btn) return 'missing';
    btn.click();
    await new Promise(r => setTimeout(r, 800));
    return { closed: !document.querySelector('.rs-root') };
  })()`);
  console.log("[studio] back:", JSON.stringify(back));

  serpent.close();
  yuh.close();
  console.log("E2E ALL PASS");
  process.exit(0);
}

main().catch((error) => {
  console.error("E2E FAILED:", error && error.stack ? error.stack : error);
  process.exit(1);
});
