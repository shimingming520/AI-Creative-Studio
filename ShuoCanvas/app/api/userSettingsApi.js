import { get as a180_0x537cdb, post as a180_0x6fb9c5 } from "./requester.js";
export async function fetchUserSettingsFromServer() {
  const _0x492da5 = await a180_0x537cdb("/api/v2/user/settings.json", {
    provider: "local"
  });
  return _0x492da5;
}
export async function saveUserSettingsToServer(_0x4bbdf6) {
  return await a180_0x6fb9c5("/api/v2/user/settings.json", _0x4bbdf6 || {}, {
    provider: "local"
  });
}
export async function startFileSavePathMigration(_0x2ce5bb) {
  return await a180_0x6fb9c5("/api/v2/user/file-save-paths/migration/start", {
    settings: _0x2ce5bb || {}
  }, {
    provider: "local",
    timeout: 10000
  });
}
export async function fetchFileSavePathMigrationStatus(_0x40e1b5) {
  const _0x31056c = encodeURIComponent(String(_0x40e1b5 || ""));
  return await a180_0x537cdb("/api/v2/user/file-save-paths/migration/status?jobId=" + _0x31056c, {
    provider: "local",
    timeout: 10000
  });
}