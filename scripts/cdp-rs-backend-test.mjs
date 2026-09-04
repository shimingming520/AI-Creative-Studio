// 验证 rs 后端链路:probe → smart-clip → extract-frame-at → materialize-shot → compose。
import WebSocket from "ws";

const CDP_PORT = 9223;
const VIDEO = "C:/Users/shi/AppData/Local/Temp/rs-e2e/test-video.mp4";
const OUT = "C:/Users/shi/AppData/Local/Temp/rs-e2e";

async function main() {
  const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  const t = targets.find((x) => x.type === "page" && /serpentHosted/.test(x.url));
  if (!t) throw new Error("no serpent target");
  const ws = new WebSocket(t.webSocketDebuggerUrl, { maxPayload: 128 * 1024 * 1024 });
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

  const result = await evaluate(`(async () => {
    const out = {};
    const host = window.serpent.host;
    // 1) probe
    try {
      const probe = await host.probe({ file: ${JSON.stringify(VIDEO)} });
      out.probe = probe;
    } catch (e) { out.probe = 'ERR ' + e.message; }
    // 2) smart clip
    let clip;
    try {
      clip = await host.smartClip({ file: ${JSON.stringify(VIDEO)}, threshold: 0.12 });
      out.clip = { durationSec: clip.durationSec, shots: clip.shots.length, first: clip.shots[0] };
    } catch (e) { out.clip = 'ERR ' + e.message; }
    // 3) extract keyframes for up to 3 shots
    try {
      const frames = [];
      for (const shot of (clip?.shots || []).slice(0, 3)) {
        const f = await host.extractFrameAt({ file: ${JSON.stringify(VIDEO)}, timeSec: shot.keyframeTimeSec });
        frames.push(f.path);
      }
      out.frames = frames.length;
      const img = await host.readImage(frames[0]);
      out.frameIsImage = img.startsWith('data:image/');
    } catch (e) { out.frames = 'ERR ' + e.message; }
    // 4) materialize first shot
    try {
      const clipOut = await host.materializeShot({
        file: ${JSON.stringify(VIDEO)},
        startSec: clip.shots[0].startSec,
        durationSec: clip.shots[0].durationSec,
        outputDir: ${JSON.stringify(OUT)},
      });
      out.materialize = clipOut;
    } catch (e) { out.materialize = 'ERR ' + e.message; }
    return out;
  })()`);
  console.log(JSON.stringify(result, null, 1));

  // 5) compose(直接用两个已素材化片段)
  const compose = await evaluate(`(async () => {
    const host = window.serpent.host;
    try {
      const a = await host.materializeShot({ file: ${JSON.stringify(VIDEO)}, startSec: 0, durationSec: 3, outputDir: ${JSON.stringify(OUT)} });
      const b = await host.materializeShot({ file: ${JSON.stringify(VIDEO)}, startSec: 3, durationSec: 3, outputDir: ${JSON.stringify(OUT)} });
      const target = ${JSON.stringify(OUT + "/composed.mp4")};
      const res = await host.compose({ shots: [{ videoPath: a.path, durationSec: 3 }, { videoPath: b.path, durationSec: 3 }], outputPath: target });
      return { ok: Boolean(res.outputPath), outputPath: res.outputPath };
    } catch (e) { return { ok: false, error: e.message }; }
  })()`);
  console.log("compose:", JSON.stringify(compose));
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
