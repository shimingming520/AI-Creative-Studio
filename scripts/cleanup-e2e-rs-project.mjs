// 清理替换工作室中的 E2E 测试项目(dev tool)。
import WebSocket from "ws";

async function main() {
  const targets = await (await fetch("http://127.0.0.1:9223/json/list")).json();
  const t = targets.find((x) => x.type === "page" && /serpentHosted/.test(x.url));
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
  const r = await send("Runtime.evaluate", {
    expression: `(async () => {
      const list = await window.serpent.host.projectsLoad();
      const out = [];
      for (const p of list.projects || []) {
        if (String(p.title).includes("E2E")) {
          await window.serpent.host.projectDelete(p.id);
          out.push("deleted " + p.id + " " + p.title);
        }
      }
      return out;
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  console.log(JSON.stringify(r.result?.value));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
