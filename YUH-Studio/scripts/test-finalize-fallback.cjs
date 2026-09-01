// Verify finalizeFromHistory transcript fallback against the real ASR history record.
const fs = require("fs");
const path = require("path");

const BACKEND = "http://127.0.0.1:8189";
const PROMPT_ID = "6f9a4f8c-7f5d-4404-ac8a-518aa2f8dee7";

(async () => {
  const res = await fetch(`${BACKEND}/history/${PROMPT_ID}`);
  const history = await res.json();
  const record = history[PROMPT_ID];
  if (!record) { console.error("no record"); process.exit(1); }

  // --- replicate finalizeFromHistory candidate collection (new code) ---
  const outputCandidates = Object.values(record.outputs || {}).flatMap((item) => [
    ...(Array.isArray(item?.images) ? item.images : []),
    ...(Array.isArray(item?.videos) ? item.videos : []),
    ...(Array.isArray(item?.gifs) ? item.gifs : []),
    ...(Array.isArray(item?.audio) ? item.audio : []),
    ...(Array.isArray(item?.files) ? item.files : []),
    ...(Array.isArray(item?.text) ? item.text : []),
  ]).filter((item) => item?.filename);
  const textStrings = Object.values(record.outputs || {}).flatMap((item) => {
    const t = item?.text;
    if (typeof t === "string") return [t];
    if (Array.isArray(t)) return t.filter((x) => typeof x === "string");
    return [];
  });
  console.log("file candidates:", outputCandidates.length);
  console.log("text strings:", textStrings.length);
  for (const t of textStrings) console.log("  TEXT:", t.slice(0, 300).replace(/\n/g, "\\n"));

  if (!outputCandidates.length && textStrings.length) {
    const dir = "scripts/tmp-transcript-check";
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, "finalize-fallback.txt");
    fs.writeFileSync(filePath, textStrings.join("\n\n"), "utf8");
    console.log("FALLBACK WRITE OK:", path.resolve(filePath), fs.statSync(filePath).size, "bytes");
  }
})().catch((e) => { console.error("FAILED:", e); process.exit(1); });
