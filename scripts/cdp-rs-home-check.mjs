// 快速验证:首页 hero + 返回资源管理按钮;输出 home 状态。
import WebSocket from "ws";

const CDP_PORT = 9223;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  const t = targets.find((x) => x.type === "page" && /serpentHosted/.test(x.url));
  if (!t) throw new Error("no serpent target");
  const ws = new WebSocket(t.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
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
        m.error ? reject(new Error(JSON.stringify(m.error).slice(0, 300))) : resolve(m.result),
      );
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error("eval: " + JSON.stringify(r.exceptionDetails).slice(0, 700));
    return r.result?.value;
  };
  await send("Runtime.enable");
  await send("Page.enable");

  const state = await evaluate(`(async () => {
    const back = Array.from(document.querySelectorAll('.rs-topbar .rs-btn')).find(b => /替换项目/.test(b.textContent));
    if (back) back.click();
    await new Promise(r => setTimeout(r, 800));
    const root = document.querySelector('.rs-root');
    return {
      hero: Boolean(root.querySelector('.rs-hero')),
      heroTitle: root.querySelector('.rs-hero .title')?.textContent || '',
      newCard: Boolean(root.querySelector('.rs-new-card')),
      projectCards: root.querySelectorAll('.rs-project-card').length,
    };
  })()`);
  console.log("[home]", JSON.stringify(state));
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const { writeFileSync } = await import("node:fs");
  writeFileSync("scripts/replacement-studio-home-shot.png", Buffer.from(shot.data, "base64"));
  console.log("[shot] saved");
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e && e.stack ? e.stack : e);
  process.exit(1);
});
