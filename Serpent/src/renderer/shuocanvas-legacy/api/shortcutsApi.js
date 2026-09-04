import { buildApiUrl } from "./apiBase.js";
import { get as a131_0x4c3952, post as a131_0x382461 } from "./requester.js";
const USER_FILE = "shortcuts.json";
export async function fetchUserShortcutsFromServer() {
  const _0x2296eb = await a131_0x4c3952("/api/v2/user/" + USER_FILE, {
    provider: "local"
  });
  return _0x2296eb;
}
export async function saveUserShortcutsToServer(_0x39fdb4) {
  await a131_0x382461("/api/v2/user/" + USER_FILE, _0x39fdb4 || {}, {
    provider: "local"
  });
  return true;
}