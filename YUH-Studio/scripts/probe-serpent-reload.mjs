// 重载 Serpent 页面并抓取控制台异常(调试)。
import WebSocket from "ws";

const CDP_PORT = 9223;
async function main() {
  const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
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
      return;
    }
    if (m.method === "Runtime.exceptionThrown") {
      console.log("EXCEPTION:", JSON.stringify(m.params.exceptionDetails).slice(0, 1600));
    }
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      console.log("CONSOLE.ERROR:", m.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 900));
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
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.reload", { ignoreCache: true });
  await new Promise((r) => setTimeout(r, 6000));
  const r = await send("Runtime.evaluate", {
    expression:
      'document.querySelector("#root") ? "root-present children=" + document.getElementById("root").childElementCount : "no-root"',
    returnByValue: true,
  });
  console.log("STATE:", r.result?.value);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
