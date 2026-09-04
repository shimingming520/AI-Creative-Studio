// CDP probe: dump legacy page sidebar state (debug helper).
import WebSocket from "ws";

const CDP_PORT = 9223;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  const t = targets.find((x) => x.type === "page");
  console.log("target:", (t?.url || "").slice(0, 100));
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
    expression: `(() => {
      const nav = document.querySelector('aside.left-rail nav');
      return {
        readyState: document.readyState,
        hasNav: Boolean(nav),
        navChildren: nav ? nav.querySelectorAll('button').length : -1,
        buttonTexts: nav ? Array.from(nav.querySelectorAll('button')).map(b => (b.textContent || '').trim()).filter(Boolean).slice(0, 22) : [],
        h3Serpent: Boolean(window.h3 && window.h3.serpent),
        h3SerpentKeys: window.h3 && window.h3.serpent ? Object.keys(window.h3.serpent).join(',') : '',
        bodyHtmlSnippet: document.body ? document.body.innerHTML.slice(0, 120) : '',
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  console.log(JSON.stringify(r.result?.value, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
