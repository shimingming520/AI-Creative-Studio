import { get as a179_0x2f5d24, post as a179_0x521092 } from "./requester.js";
export async function checkUpdateFromServer(_0x2620b1 = {}) {
  const _0x315044 = new URLSearchParams();
  if (_0x2620b1.force) {
    _0x315044.set("force", "1");
  }
  if (_0x2620b1.includeCurrent) {
    _0x315044.set("includeCurrent", "1");
  }
  const _0x5f318e = _0x315044.toString();
  const _0x2e20a2 = await a179_0x2f5d24("/api/v2/update/check" + (_0x5f318e ? "?" + _0x5f318e : ""), {
    provider: "local"
  });
  return _0x2e20a2;
}
export async function checkLocalUpdatePreviewFromServer() {
  const _0x1f29e9 = await a179_0x2f5d24("/api/v2/update/local-preview", {
    provider: "local"
  });
  return _0x1f29e9;
}
export async function applyUpdateFromServer() {
  const _0x211ef2 = await a179_0x521092("/api/v2/update/apply", {}, {
    provider: "local"
  });
  return _0x211ef2;
}
export async function pingUpdateCheckFromServer() {
  try {
    await a179_0x2f5d24("/api/v2/update/check", {
      provider: "local"
    });
    return true;
  } catch {
    return false;
  }
}